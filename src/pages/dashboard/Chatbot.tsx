import { MessageCircle } from 'lucide-react';

const Chatbot = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
      <div className="size-20 rounded-2xl bg-primary/10 grid place-items-center mb-6">
        <MessageCircle className="size-10 text-primary" />
      </div>
      <h1 className="font-display text-3xl sm:text-4xl uppercase text-ink">AI Chatbot</h1>
      <p className="mt-3 text-ink-soft max-w-md text-sm sm:text-base">
        Ask questions about your business data. Get smart insights, generate reminders, and more — powered by AI.
      </p>
      <div className="mt-8 px-4 py-2 rounded-full bg-primary/10 text-primary text-xs font-semibold uppercase tracking-widest">
        Coming Soon
      </div>
    </div>
  );
};

export default Chatbot;
