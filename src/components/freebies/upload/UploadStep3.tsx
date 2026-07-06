'use client';

interface UploadStep3Props {
  title: string;
  description: string;
  estimatedReadingTime: string;
  price: string;
  currency: string;
  onTitleChange: (v: string) => void;
  onDescriptionChange: (v: string) => void;
  onEstimatedReadingTimeChange: (v: string) => void;
  onPriceChange: (v: string) => void;
  onCurrencyChange: (v: string) => void;
}

export function UploadStep3({ 
  title, description, estimatedReadingTime, price, currency,
  onTitleChange, onDescriptionChange, onEstimatedReadingTimeChange,
  onPriceChange, onCurrencyChange
}: UploadStep3Props) {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <label className="text-base font-medium text-text-primary">Title</label>
        <div className="rounded-md border border-white/20 bg-white/5 backdrop-blur-sm px-4 py-3">
          <input
            type="text"
            value={title}
            onChange={(e) => onTitleChange(e.target.value)}
            placeholder="Enter item title"
            maxLength={200}
            className="w-full bg-transparent text-sm font-semibold text-[#eaeaea] placeholder:text-white/30 outline-none"
          />
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-6">
        <div className="flex flex-col gap-1 flex-1">
          <label className="text-base font-medium text-text-primary">Estimated Reading Time (min)</label>
          <div className="rounded-md border border-white/20 bg-white/5 backdrop-blur-sm px-4 py-3">
            <input
              type="number"
              min="1"
              value={estimatedReadingTime}
              onChange={(e) => onEstimatedReadingTimeChange(e.target.value)}
              placeholder="e.g. 45"
              className="w-full bg-transparent text-sm font-semibold text-[#eaeaea] placeholder:text-white/30 outline-none"
            />
          </div>
        </div>

        <div className="flex flex-col gap-1 flex-1">
          <div className="flex items-center justify-between">
            <label className="text-base font-medium text-text-primary">Price</label>
            <span className="text-[10px] text-text-gray">Set 0 for free</span>
          </div>
          <div className="flex gap-2">
            <div className="flex-[2] rounded-md border border-white/20 bg-white/5 backdrop-blur-sm px-4 py-3">
              <input
                type="number"
                min="0"
                value={price}
                onChange={(e) => onPriceChange(e.target.value)}
                placeholder="0.00"
                className="w-full bg-transparent text-sm font-semibold text-[#eaeaea] placeholder:text-white/30 outline-none"
              />
            </div>
            <select
              value={currency}
              onChange={(e) => onCurrencyChange(e.target.value)}
              className="flex-1 rounded-md border border-white/20 bg-zinc-900 px-2 py-3 text-sm font-semibold text-[#eaeaea] outline-none"
            >
              <option value="NGN">NGN</option>
              <option value="USD">USD</option>
            </select>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-base font-medium text-text-primary">Description</label>
        <div className="rounded-md border border-white/20 bg-white/5 backdrop-blur-sm px-4 py-3">
          <textarea
            value={description}
            onChange={(e) => onDescriptionChange(e.target.value)}
            placeholder="Write a short description explaining what's inside this bundle..."
            rows={4}
            className="w-full bg-transparent text-sm font-semibold text-[#eaeaea] placeholder:text-white/30 outline-none resize-none"
          />
        </div>
      </div>
    </div>
  );
}
