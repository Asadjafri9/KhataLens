import { FileSpreadsheet } from 'lucide-react';

const ImportSheet = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
      <div className="size-20 rounded-2xl bg-primary/10 grid place-items-center mb-6">
        <FileSpreadsheet className="size-10 text-primary" />
      </div>
      <h1 className="font-display text-3xl sm:text-4xl uppercase text-ink">Import Sheet</h1>
      <p className="mt-3 text-ink-soft max-w-md text-sm sm:text-base">
        Upload and import customer data from CSV files or scan handwritten ledger pages.
      </p>
      <div className="mt-8 px-4 py-2 rounded-full bg-primary/10 text-primary text-xs font-semibold uppercase tracking-widest">
        Coming Soon
      </div>
    </div>
  );
};

export default ImportSheet;
