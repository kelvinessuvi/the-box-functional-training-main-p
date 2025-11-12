export default function Founders() {
  const people = [
    {
      name: "Ricardo Buta",
      title: "Co-Fundador",
      img: "/portrait-ricardo-buta.jpg?v=2025-08-13",
    },
    {
      name: "Mauro Sérgio",
      title: "Co-Fundador",
      img: "/portrait-mauro-sergio.jpg?v=2025-08-13",
    },
  ]

  return (
    <section className="mx-auto max-w-7xl px-4 py-12 sm:py-16">
      <h2 className="text-2xl font-bold sm:text-3xl">Nossos Fundadores</h2>
      <p className="mt-2 max-w-2xl text-sm text-muted-foreground sm:text-base">
        Conheça os líderes por trás do Super Beast Team Building.
      </p>

      <ul className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2">
        {people.map((p) => (
          <li key={p.name} className="flex items-center gap-4 rounded-lg border p-4 sm:p-5">
            <img
              src={p.img}
              alt={`Foto de ${p.name}`}
              className="h-16 w-16 rounded-full object-cover sm:h-20 sm:w-20"
              loading="lazy"
            />
            <div>
              <p className="text-base font-semibold sm:text-lg">{p.name}</p>
              <p className="text-sm text-muted-foreground">{p.title}</p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  )
}
