import { ImagePlus, LoaderCircle, Trash2, Upload } from 'lucide-react';
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

export function ImageUpload({ label, value, onChange, multiple, values = [], onChangeMany }: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);

  async function handleFiles(files: FileList | null) {
    if (!files?.length) return;

    setUploading(true);
    try {
      const selected = Array.from(files).filter((file) => file.type.startsWith('image/'));
      if (!selected.length) throw new Error('Selecione pelo menos uma imagem válida.');

      if (multiple) {
        const uploaded = await Promise.all(selected.map(uploadImage));
        onChangeMany?.([...values, ...uploaded]);
      } else {
        const uploaded = await uploadImage(selected[0]);
        const previous = value;
        onChange(uploaded);
        if (previous) await removeImage(previous);
      }
    } catch (error) {
      window.alert(error instanceof Error ? error.message : 'Não foi possível enviar a imagem.');
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
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
        <span className="text-sm font-medium text-zinc-900">{uploading ? 'Enviando imagem...' : 'Selecionar imagem ou arrastar aqui'}</span>
        <span className="mt-1 text-xs text-zinc-500">A imagem é otimizada e armazenada com segurança no Supabase</span>
      </button>
      <input
        ref={inputRef}
        className="hidden"
        type="file"
        accept="image/*"
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
    </div>
  );
}
