import { Check, ImagePlus, LoaderCircle, Trash2, Upload, X } from 'lucide-react';
import { useRef, useState } from 'react';
import { supabase } from '../lib/supabase';
import { cn } from '../lib/utils';

type ImageUploadProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  multiple?: boolean;
  values?: string[];
  onChangeMany?: (values: string[]) => void;
  cropAspect?: number;
  cropHint?: string;
};

type CropState = {
  file: File;
  src: string;
};

const BUCKET = 'pintarbh-images';
const MAX_FILE_SIZE = 10 * 1024 * 1024;

async function optimizeImage(file: File): Promise<{ blob: Blob; contentType: string; extension: string }> {
  if (file.size > MAX_FILE_SIZE) {
    throw new Error('A imagem deve ter no máximo 10 MB.');
  }

  if (file.type === 'image/svg+xml' || file.type === 'image/gif') {
    return { blob: file, contentType: file.type, extension: file.type === 'image/svg+xml' ? 'svg' : 'gif' };
  }

  if (!file.type.startsWith('image/')) {
    throw new Error('Selecione um arquivo de imagem válido.');
  }

  const bitmap = await createImageBitmap(file);
  const maxSize = 1600;
  const scale = Math.min(1, maxSize / Math.max(bitmap.width, bitmap.height));
  const width = Math.max(1, Math.round(bitmap.width * scale));
  const height = Math.max(1, Math.round(bitmap.height * scale));
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;

  const context = canvas.getContext('2d');
  if (!context) {
    bitmap.close();
    throw new Error('Não foi possível preparar a imagem neste dispositivo.');
  }

  context.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  const webp = await canvasToBlob(canvas, 'image/webp', 0.82);
  if (webp) return { blob: webp, contentType: 'image/webp', extension: 'webp' };

  const jpeg = await canvasToBlob(canvas, 'image/jpeg', 0.82);
  if (jpeg) return { blob: jpeg, contentType: 'image/jpeg', extension: 'jpg' };

  throw new Error('Não foi possível otimizar a imagem.');
}

function canvasToBlob(canvas: HTMLCanvasElement, type: string, quality: number) {
  return new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, type, quality));
}

async function uploadImage(file: File) {
  if (!supabase) {
    throw new Error('O Supabase não está configurado neste ambiente.');
  }

  const optimized = await optimizeImage(file);
  const path = `admin/${crypto.randomUUID()}.${optimized.extension}`;

  const { error } = await supabase.storage.from(BUCKET).upload(path, optimized.blob, {
    contentType: optimized.contentType,
    cacheControl: '31536000',
    upsert: false,
  });

  if (error) throw new Error(`Não foi possível enviar a imagem: ${error.message}`);

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

function getStoragePath(url: string) {
  const marker = `/${BUCKET}/`;
  const index = url.indexOf(marker);
  if (index === -1) return null;
  return decodeURIComponent(url.slice(index + marker.length).split('?')[0]);
}

async function removeImage(url: string) {
  if (!supabase) return;
  const path = getStoragePath(url);
  if (!path) return;

  const { error } = await supabase.storage.from(BUCKET).remove([path]);
  if (error) console.warn('Não foi possível remover a imagem antiga do Storage:', error.message);
}

async function cropFile(file: File, aspect: number, zoom: number, offset: { x: number; y: number }, natural: { width: number; height: number }, frame: { width: number; height: number }) {
  const src = URL.createObjectURL(file);
  try {
    const image = new Image();
    image.src = src;
    await new Promise<void>((resolve, reject) => {
      image.onload = () => resolve();
      image.onerror = () => reject(new Error('Não foi possível preparar a imagem para o corte.'));
    });

    const frameRatio = frame.width / frame.height;
    const imageRatio = natural.width / natural.height;
    const baseWidth = imageRatio > frameRatio ? frame.height * imageRatio : frame.width;
    const baseHeight = imageRatio > frameRatio ? frame.height : frame.width / imageRatio;
    const renderedWidth = baseWidth * zoom;
    const renderedHeight = baseHeight * zoom;
    const left = (frame.width - renderedWidth) / 2 + offset.x;
    const top = (frame.height - renderedHeight) / 2 + offset.y;
    const scale = renderedWidth / natural.width;

    const sourceX = Math.max(0, Math.min(natural.width - frame.width / scale, -left / scale));
    const sourceY = Math.max(0, Math.min(natural.height - frame.height / scale, -top / scale));
    const sourceWidth = Math.min(natural.width - sourceX, frame.width / scale);
    const sourceHeight = Math.min(natural.height - sourceY, frame.height / scale);

    const outputWidth = aspect === 1 ? 1000 : 1600;
    const outputHeight = Math.max(1, Math.round(outputWidth / aspect));
    const canvas = document.createElement('canvas');
    canvas.width = outputWidth;
    canvas.height = outputHeight;
    const context = canvas.getContext('2d');
    if (!context) throw new Error('Não foi possível criar o corte da imagem.');

    context.imageSmoothingEnabled = true;
    context.imageSmoothingQuality = 'high';
    context.drawImage(image, sourceX, sourceY, sourceWidth, sourceHeight, 0, 0, outputWidth, outputHeight);

    const blob = await canvasToBlob(canvas, 'image/webp', 0.9);
    if (!blob) throw new Error('Não foi possível finalizar o corte da imagem.');

    return new File([blob], `imagem-cortada-${Date.now()}.webp`, { type: 'image/webp' });
  } finally {
    URL.revokeObjectURL(src);
  }
}

export function ImageUpload({ label, value, onChange, multiple, values = [], onChangeMany, cropAspect, cropHint }: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const cropAreaRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{ x: number; y: number; offsetX: number; offsetY: number } | null>(null);
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [cropState, setCropState] = useState<CropState | null>(null);
  const [cropZoom, setCropZoom] = useState(1);
  const [cropOffset, setCropOffset] = useState({ x: 0, y: 0 });
  const [cropNatural, setCropNatural] = useState({ width: 0, height: 0 });

  function clampOffset(next: { x: number; y: number }) {
    const area = cropAreaRef.current;
    if (!area || !cropNatural.width || !cropNatural.height || !cropAspect) return next;

    const frameWidth = area.clientWidth;
    const frameHeight = area.clientHeight;
    const frameRatio = frameWidth / frameHeight;
    const imageRatio = cropNatural.width / cropNatural.height;
    const baseWidth = imageRatio > frameRatio ? frameHeight * imageRatio : frameWidth;
    const baseHeight = imageRatio > frameRatio ? frameHeight : frameWidth / imageRatio;
    const maxX = Math.max(0, (baseWidth * cropZoom - frameWidth) / 2);
    const maxY = Math.max(0, (baseHeight * cropZoom - frameHeight) / 2);

    return {
      x: Math.max(-maxX, Math.min(maxX, next.x)),
      y: Math.max(-maxY, Math.min(maxY, next.y)),
    };
  }

  function openCrop(file: File) {
    if (!cropAspect) return false;
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      window.alert('Para usar o editor de corte, selecione JPG, PNG ou WEBP.');
      return true;
    }

    const src = URL.createObjectURL(file);
    setCropState({ file, src });
    setCropZoom(1);
    setCropOffset({ x: 0, y: 0 });
    setCropNatural({ width: 0, height: 0 });
    return true;
  }

  async function uploadSelected(file: File) {
    const uploaded = await uploadImage(file);
    const previous = value;
    onChange(uploaded);
    if (previous) await removeImage(previous);
  }

  async function handleFiles(files: FileList | null) {
    if (!files?.length) return;

    const selected = Array.from(files).filter((file) => file.type.startsWith('image/'));
    if (!selected.length) {
      window.alert('Selecione pelo menos uma imagem válida.');
      return;
    }

    if (!multiple && selected[0] && openCrop(selected[0])) return;

    setUploading(true);
    try {
      if (multiple) {
        const uploaded = await Promise.all(selected.map(uploadImage));
        onChangeMany?.([...values, ...uploaded]);
      } else {
        await uploadSelected(selected[0]);
      }
    } catch (error) {
      window.alert(error instanceof Error ? error.message : 'Não foi possível enviar a imagem.');
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  }

  async function confirmCrop() {
    if (!cropState || !cropAspect || !cropNatural.width || !cropAreaRef.current) return;

    setUploading(true);
    try {
      const area = cropAreaRef.current;
      const cropped = await cropFile(
        cropState.file,
        cropAspect,
        cropZoom,
        clampOffset(cropOffset),
        cropNatural,
        { width: area.clientWidth, height: area.clientHeight },
      );
      await uploadSelected(cropped);
      URL.revokeObjectURL(cropState.src);
      setCropState(null);
    } catch (error) {
      window.alert(error instanceof Error ? error.message : 'Não foi possível aplicar o corte.');
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  }

  function cancelCrop() {
    if (cropState) URL.revokeObjectURL(cropState.src);
    setCropState(null);
    if (inputRef.current) inputRef.current.value = '';
  }

  async function handleRemove(item: string, index: number) {
    setUploading(true);
    try {
      await removeImage(item);
      if (multiple) onChangeMany?.(values.filter((_, itemIndex) => itemIndex !== index));
      else onChange('');
    } finally {
      setUploading(false);
    }
  }

  const previewItems = multiple ? values : value ? [value] : [];

  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-zinc-800">{label}</label>
      <button
        type="button"
        disabled={uploading}
        onClick={() => inputRef.current?.click()}
        onDragOver={(event) => {
          event.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(event) => {
          event.preventDefault();
          setDragging(false);
          void handleFiles(event.dataTransfer.files);
        }}
        className={cn(
          'relative flex min-h-36 w-full flex-col items-center justify-center rounded-lg border border-dashed border-zinc-300 bg-zinc-50 p-4 text-center transition',
          dragging && 'border-zinc-950 bg-white shadow-soft',
          uploading && 'cursor-wait opacity-70',
        )}
      >
        {uploading ? <LoaderCircle className="mb-3 h-7 w-7 animate-spin text-zinc-500" /> : <ImagePlus className="mb-3 h-7 w-7 text-zinc-500" />}
        <span className="text-sm font-medium text-zinc-900">{uploading ? 'Enviando imagem...' : cropAspect ? 'Selecionar imagem e editar corte' : 'Selecionar imagem ou arrastar aqui'}</span>
        <span className="mt-1 text-xs text-zinc-500">{cropHint ?? 'A imagem é otimizada e armazenada com segurança no Supabase'}</span>
      </button>
      <input
        ref={inputRef}
        className="hidden"
        type="file"
        accept={cropAspect ? 'image/jpeg,image/png,image/webp' : 'image/*'}
        multiple={multiple}
        onChange={(event) => void handleFiles(event.target.files)}
      />
      {previewItems.length > 0 && (
        <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {previewItems.map((item, index) => (
            <div key={`${item}-${index}`} className="group relative overflow-hidden rounded-lg border border-zinc-200">
              <img src={item} alt="" className="h-28 w-full object-cover" />
              <div className="absolute inset-x-2 bottom-2 flex gap-2 opacity-0 transition group-hover:opacity-100">
                <button type="button" disabled={uploading} className="grid h-8 flex-1 place-items-center rounded-full bg-white text-zinc-950 disabled:opacity-50" onClick={() => inputRef.current?.click()} title="Substituir imagem">
                  <Upload className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  disabled={uploading}
                  className="grid h-8 flex-1 place-items-center rounded-full bg-white text-red-600 disabled:opacity-50"
                  onClick={() => void handleRemove(item, index)}
                  title="Remover imagem"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {cropState && cropAspect && (
        <div className="fixed inset-0 z-[200] grid place-items-center bg-zinc-950/70 p-4 backdrop-blur-sm">
          <section className="w-full max-w-2xl overflow-hidden rounded-3xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-zinc-200 px-5 py-4">
              <div>
                <h2 className="text-lg font-semibold">Editar corte da imagem</h2>
                <p className="text-xs text-zinc-500">Arraste a imagem e ajuste o zoom até ficar como deseja.</p>
              </div>
              <button type="button" onClick={cancelCrop} className="grid h-9 w-9 place-items-center rounded-full border border-zinc-200" aria-label="Fechar editor"><X className="h-4 w-4" /></button>
            </div>

            <div className="p-5">
              <div
                ref={cropAreaRef}
                className="relative mx-auto w-full max-w-xl overflow-hidden rounded-2xl bg-zinc-950 touch-none"
                style={{ aspectRatio: cropAspect }}
              >
                {cropState.src && (
                  <img
                    src={cropState.src}
                    alt="Pré-visualização do corte"
                    draggable={false}
                    onLoad={(event) => setCropNatural({ width: event.currentTarget.naturalWidth, height: event.currentTarget.naturalHeight })}
                    onPointerDown={(event) => {
                      event.currentTarget.setPointerCapture(event.pointerId);
                      dragRef.current = { x: event.clientX, y: event.clientY, offsetX: cropOffset.x, offsetY: cropOffset.y };
                    }}
                    onPointerMove={(event) => {
                      if (!dragRef.current) return;
                      const next = {
                        x: dragRef.current.offsetX + event.clientX - dragRef.current.x,
                        y: dragRef.current.offsetY + event.clientY - dragRef.current.y,
                      };
                      setCropOffset(clampOffset(next));
                    }}
                    onPointerUp={() => { dragRef.current = null; }}
                    onPointerCancel={() => { dragRef.current = null; }}
                    className="h-full w-full select-none object-cover"
                    style={{ transform: `translate(${cropOffset.x}px, ${cropOffset.y}px) scale(${cropZoom})`, cursor: dragRef.current ? 'grabbing' : 'grab' }}
                  />
                )}
                <div className="pointer-events-none absolute inset-0" style={{ boxShadow: 'inset 0 0 0 1px rgba(255,255,255,.85), inset 0 0 0 9999px rgba(0,0,0,.16)' }} />
              </div>

              <div className="mt-5">
                <div className="flex items-center justify-between text-sm font-medium">
                  <span>Zoom</span>
                  <span className="text-zinc-500">{Math.round(cropZoom * 100)}%</span>
                </div>
                <input
                  className="mt-3 w-full accent-zinc-950"
                  type="range"
                  min="1"
                  max="3"
                  step="0.01"
                  value={cropZoom}
                  onChange={(event) => {
                    const nextZoom = Number(event.target.value);
                    setCropZoom(nextZoom);
                    window.requestAnimationFrame(() => setCropOffset(clampOffset(cropOffset)));
                  }}
                />
              </div>

              <div className="mt-5 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <button type="button" className="button-secondary" onClick={cancelCrop} disabled={uploading}>Cancelar</button>
                <button type="button" className="button-primary" onClick={() => void confirmCrop()} disabled={uploading || !cropNatural.width}>
                  {uploading ? <LoaderCircle className="h-5 w-5 animate-spin" /> : <Check className="h-5 w-5" />}
                  {uploading ? 'Aplicando...' : 'Aplicar corte e usar imagem'}
                </button>
              </div>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
