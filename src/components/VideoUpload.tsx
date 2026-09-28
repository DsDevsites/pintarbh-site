import { Check, Film, LoaderCircle, Trash2, Upload, X } from 'lucide-react';
import { useRef, useState } from 'react';
import { supabase } from '../lib/supabase';
import { cn } from '../lib/utils';

type VideoUploadProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
};

const BUCKET = 'pintarbh-images';
const MAX_FILE_SIZE = 100 * 1024 * 1024;
const VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/quicktime'];

function getStoragePath(url: string) {
  const marker = `/${BUCKET}/`;
  const index = url.indexOf(marker);
  if (index === -1) return null;
  return decodeURIComponent(url.slice(index + marker.length).split('?')[0]);
}

async function removeVideo(url: string) {
  if (!supabase) return;
  const path = getStoragePath(url);
  if (!path) return;
  const { error } = await supabase.storage.from(BUCKET).remove([path]);
  if (error) console.warn('Não foi possível remover o vídeo antigo:', error.message);
}

async function uploadVideo(file: File) {
  if (!supabase) throw new Error('O Supabase não está configurado neste ambiente.');
  if (!VIDEO_TYPES.includes(file.type)) {
    throw new Error('Selecione um vídeo MP4, WebM ou MOV.');
  }
  if (file.size > MAX_FILE_SIZE) {
    throw new Error('O vídeo deve ter no máximo 100 MB.');
  }

  const extension = file.type === 'video/webm' ? 'webm' : file.type === 'video/quicktime' ? 'mov' : 'mp4';
  const path = `videos/${crypto.randomUUID()}.${extension}`;
  const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
    contentType: file.type,
    cacheControl: '31536000',
    upsert: false,
  });

  if (error) throw new Error(`Não foi possível enviar o vídeo: ${error.message}`);
  return supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
}

export function VideoUpload({ label, value, onChange }: VideoUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [dragging, setDragging] = useState(false);

  async function handleFile(file: File | undefined) {
    if (!file) return;
    setUploading(true);
    try {
      const previous = value;
      const uploaded = await uploadVideo(file);
      onChange(uploaded);
      if (previous) await removeVideo(previous);
    } catch (error) {
      window.alert(error instanceof Error ? error.message : 'Não foi possível enviar o vídeo.');
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  }

  async function remove() {
    if (!value) return;
    setUploading(true);
    try {
      await removeVideo(value);
      onChange('');
    } finally {
      setUploading(false);
    }
  }

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
          void handleFile(event.dataTransfer.files?.[0]);
        }}
        className={cn(
          'relative flex min-h-36 w-full flex-col items-center justify-center rounded-lg border border-dashed border-zinc-300 bg-zinc-50 p-5 text-center transition',
          dragging && 'border-zinc-950 bg-white shadow-soft',
          uploading && 'cursor-wait opacity-70',
        )}
      >
        {uploading ? <LoaderCircle className="mb-3 h-7 w-7 animate-spin text-zinc-500" /> : <Film className="mb-3 h-7 w-7 text-zinc-500" />}
        <span className="text-sm font-medium text-zinc-900">
          {uploading ? 'Enviando vídeo...' : value ? 'Substituir vídeo' : 'Selecionar vídeo do dispositivo'}
        </span>
        <span className="mt-1 text-xs text-zinc-500">MP4, WebM ou MOV • máximo 100 MB</span>
      </button>

      <input
        ref={inputRef}
        className="hidden"
        type="file"
        accept="video/mp4,video/webm,video/quicktime,.mp4,.webm,.mov"
        onChange={(event) => void handleFile(event.target.files?.[0])}
      />

      {value && (
        <div className="mt-4 overflow-hidden rounded-2xl border border-zinc-200 bg-zinc-950">
          <video src={value} controls preload="metadata" className="max-h-96 w-full bg-black" />
          <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3">
            <span className="inline-flex items-center gap-2 text-sm text-zinc-600">
              <Check className="h-4 w-4" /> Vídeo selecionado
            </span>
            <div className="flex gap-2">
              <button type="button" className="button-secondary" disabled={uploading} onClick={() => inputRef.current?.click()}>
                <Upload className="h-4 w-4" /> Substituir
              </button>
              <button type="button" className="button-secondary text-red-600" disabled={uploading} onClick={() => void remove()}>
                <Trash2 className="h-4 w-4" /> Remover
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
