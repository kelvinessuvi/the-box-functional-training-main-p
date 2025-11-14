import Image from "next/image"

export default function Hero() {
  return (
    <section id="home" className="relative isolate w-full overflow-hidden min-h-[90vh] flex items-center">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: 'url(/images/hero-background.jpg)',
        }}
      >
        {/* Dark Overlay para melhorar legibilidade do texto */}
        <div className="absolute inset-0 bg-black/70"></div>
      </div>
      
      {/* Content */}
      <div className="relative mx-auto flex max-w-6xl flex-col items-center gap-6 px-4 py-12 text-center sm:gap-8 sm:py-20 md:py-28 lg:py-36">
        {/* Logo */}
        <div className="mb-4">
          <Image
            src="/images/the-box-logo.svg"
            alt="THE BOX Functional Training"
            width={300}
            height={100}
            className="h-20 sm:h-24 md:h-32 w-auto"
          />
        </div>
        
        {/* Main Heading */}
        <h1 className="text-3xl font-black leading-tight tracking-tight text-[#D4AF37] sm:text-4xl md:text-5xl lg:text-6xl drop-shadow-lg">
          AQUI O SISTEMA É BRUTO
        </h1>
        
        {/* Description */}
        <p className="max-w-3xl text-balance text-sm text-white sm:text-base md:text-lg lg:text-xl drop-shadow-md text-[#B3B3B3]">
          Academia de Artes Marciais com foco em Jiu-Jitsu. Transformamos vidas através do treino, disciplina e desenvolvimento pessoal em Angola e Portugal.
        </p>
      </div>
    </section>
  )
}
