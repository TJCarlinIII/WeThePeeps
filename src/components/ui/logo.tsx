export default function Logo({ size = "text-xl" }: { size?: string }) {
  return (
    <div className="flex flex-col">
      <h1 
        className={`${size} font-black tracking-tighter uppercase bg-cover bg-center bg-no-repeat leading-none`}
        style={{ 
          backgroundImage: 'url(/american-flag.jpg)',
          WebkitBackgroundClip: 'text',
          backgroundClip: 'text',
          color: 'transparent'
        }}
      >
        We The Peeps
      </h1>
      <span className="text-[8px] tracking-[0.4em] text-[#C4A77D] italic uppercase mt-1">
        Shall not be infringed
      </span>
    </div>
  );
}