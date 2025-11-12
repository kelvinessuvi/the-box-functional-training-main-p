import { Clock, Users, Target, Trophy, Star, Heart } from "lucide-react"

export default function HowItWorks() {
  const steps = [
    {
      number: 1,
      icon: Clock,
      iconColor: "bg-blue-500",
      title: "Boas-Vindas & Energização",
      duration: "30 min",
      description: "Apresentação da equipa e exercícios de aquecimento para criar energia positiva."
    },
    {
      number: 2,
      icon: Users,
      iconColor: "bg-green-500",
      title: "Formação de Equipas",
      duration: "45 min",
      description: "Divisão em equipas e estabelecimento de objetivos comuns."
    },
    {
      number: 3,
      icon: Target,
      iconColor: "bg-orange-500",
      title: "Desafios Colaborativos",
      duration: "90 min",
      description: "Exercícios funcionais e desafios que requerem trabalho em equipa."
    },
    {
      number: 4,
      icon: Trophy,
      iconColor: "bg-red-500",
      title: "Competição Saudável",
      duration: "60 min",
      description: "Jogos competitivos que promovem espírito de equipa e superação."
    },
    {
      number: 5,
      icon: Star,
      iconColor: "bg-purple-500",
      title: "Reflexão & Aprendizado",
      duration: "30 min",
      description: "Momento de partilha de experiências e aprendizagens adquiridas."
    },
    {
      number: 6,
      icon: Heart,
      iconColor: "bg-pink-500",
      title: "Confraternização",
      duration: "15 min",
      description: "Celebração dos resultados e fortalecimento dos laços criados."
    }
  ]

  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:py-20">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold sm:text-4xl mb-4">Como Funciona</h2>
        <p className="max-w-3xl mx-auto text-lg text-muted-foreground">
          O nosso programa está estruturado em 6 etapas cuidadosamente planeadas, 
          com uma duração total de 4h30min para maximizar o impacto na tua equipa.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {steps.map((step) => (
          <div key={step.number} className="bg-white rounded-lg p-6 shadow-lg border border-gray-100">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center text-white font-bold text-lg mr-4">
                {step.number}
              </div>
              <div className={`w-10 h-10 ${step.iconColor} rounded-lg flex items-center justify-center`}>
                <step.icon className="w-5 h-5 text-white" />
              </div>
            </div>
            
            <h3 className="text-lg font-bold mb-2">{step.title}</h3>
            <div className="flex items-center mb-3">
              <Clock className="w-4 h-4 text-red-600 mr-2" />
              <span className="text-sm font-medium text-red-600">{step.duration}</span>
            </div>
            <p className="text-sm text-muted-foreground">{step.description}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
