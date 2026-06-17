import { ImagePlus, Trash2, Upload } from 'lucide-react';
import { useRef, useState } from 'react';
import { cn } from '../lib/utils';

type ImageUploadProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  multiple?: boolean;
  values?: string[];
  onChangeMany?: (values: string[]) => void;
};

function readFile(file: File) {
  return new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.readAsDataURL(file);
  });
}

export function ImageUpload({ label, value, onChange, multiple, values = [], onChangeMany }: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  async function handleFiles(files: FileList | null) {
    if (!files?.length) return;
    const images = await Promise.all(Array.from(files).filter((file) => file.type.startsWith('image/')).map(readFile));
    if (multiple) onChangeMany?.([...values, ...images]);
    else onChange(images[0]);
  }

  const previewItems = multiple ? values : value ? [value] : [];

  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-zinc-800">{label}</label>
      <button
        type="button"
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
          'flex min-h-36 w-full flex-col items-center justify-center rounded-lg border border-dashed border-zinc-300 bg-zinc-50 p-4 text-center transition',
          dragging && 'border-zinc-950 bg-white shadow-soft',
        )}
      >
        <ImagePlus className="mb-3 h-7 w-7 text-zinc-500" />
        <span className="text-sm font-medium text-zinc-900">Selecionar imagem ou arrastar aqui</span>
        <span className="mt-1 text-xs text-zinc-500">Compatível com computador e celular</span>
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
                <button type="button" className="grid h-8 flex-1 place-items-center rounded-full bg-white text-zinc-950" onClick={() => inputRef.current?.click()} title="Substituir imagem">
                  <Upload className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  className="grid h-8 flex-1 place-items-center rounded-full bg-white text-red-600"
                  onClick={() => (multiple ? onChangeMany?.(values.filter((_, itemIndex) => itemIndex !== index)) : onChange(''))}
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
