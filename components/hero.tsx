export default function Hero() {
  return (
    <section className="relative isolate w-full overflow-hidden bg-gradient-to-br from-[#4d0d16] to-[#7e0d1f]">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-6 px-4 py-20 text-center sm:py-28 md:py-36">
        <h1 className="text-4xl font-extrabold leading-tight tracking-tight text-white sm:text-5xl md:text-6xl">
          Transforme sua equipe em uma
          <span className="block text-[#f3cc2f]">Super Beast</span>
        </h1>
        <p className="max-w-3xl text-balance text-base text-white/80 sm:text-lg md:text-xl">
          Experiências únicas de Team Building que fortalecem laços, desenvolvem liderança e impulsionam resultados.
        </p>
        {/* Botões removidos a pedido */}
      </div>
    </section>
  )
}
