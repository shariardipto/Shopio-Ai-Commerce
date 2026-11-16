import Icon from "@/components/Icon";

const FEATURES = [
  { icon: "sparkles", text: "Find products with a photo or your camera" },
  { icon: "cash", text: "Pay with Cash on Delivery" },
  { icon: "truck", text: "Track every order in one place" },
];

// Two-column layout for Login / Sign Up: brand panel (desktop only) + form card.
export default function AuthShell({ title, subtitle, children }) {
  return (
    <div className="mx-auto grid max-w-5xl gap-8 px-4 py-10 sm:py-16 lg:grid-cols-2 lg:items-stretch">
      <div className="relative hidden overflow-hidden rounded-3xl bg-linear-to-br from-indigo-600 via-violet-600 to-fuchsia-600 p-10 text-white shadow-xl shadow-indigo-500/20 lg:flex lg:flex-col lg:justify-between">
        <div aria-hidden="true" className="absolute -top-16 -right-16 h-64 w-64 animate-float rounded-full bg-white/10" />
        <div aria-hidden="true" className="absolute -bottom-20 -left-10 h-64 w-64 animate-float rounded-full bg-white/10 [animation-delay:-4s]" />

        <div className="relative">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold backdrop-blur">
            <Icon name="sparkles" className="h-4 w-4" /> AI-powered shopping
          </span>
          <h2 className="mt-6 text-3xl leading-tight font-extrabold">Shop smarter with Shopio.</h2>
          <p className="mt-3 text-white/80">Search by text, photo or camera and get what you need, fast.</p>
        </div>

        <ul className="relative mt-10 space-y-4">
          {FEATURES.map((feature) => (
            <li key={feature.text} className="flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/15">
                <Icon name={feature.icon} className="h-5 w-5" />
              </span>
              <span className="text-sm font-medium">{feature.text}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="card animate-fade-up p-6 sm:p-10">
        <h1 className="text-2xl font-extrabold tracking-tight text-gray-900 sm:text-3xl">{title}</h1>
        <p className="mt-1.5 text-gray-600">{subtitle}</p>
        {children}
      </div>
    </div>
  );
}
