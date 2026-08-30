type SearchFormProps = {
  value: string;
  onChange: (value: string) => void;
};

export function SearchForm({ value, onChange }: SearchFormProps) {
  return (
    <div className="mx-auto flex w-full max-w-xl flex-col gap-4">
      <label htmlFor="search-term" className="text-left text-sm font-medium text-gray-700">
        Enter an app name below:
      </label>
      <input
        id="search-term"
        type="search"
        autoFocus
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded border border-gray-300 px-3 py-2 text-base shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
        placeholder="Search the App Store"
      />
    </div>
  );
}
