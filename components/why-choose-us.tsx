import { Award, Shield, CheckCircle2 } from "lucide-react"

export default function WhyChooseUs() {
  const reasons = [
    {
      title: "Professional Excellence",
      description:
        "Our team consists of highly trained and experienced professionals dedicated to delivering top-quality service.",
      icon: <Award className="h-12 w-12 text-primary" />,
    },
    {
      title: "Comprehensive Solutions",
      description:
        "From daily chores to specialized care, we provide all-in-one home management solutions tailored to your needs.",
      icon: <CheckCircle2 className="h-12 w-12 text-primary" />,
    },
    {
      title: "Trust & Security",
      description: "We prioritize your safety and peace of mind with vetted staff and secure service protocols.",
      icon: <Shield className="h-12 w-12 text-primary" />,
    },
  ]

  return (
    <section className="py-16 bg-gray-50">
      <div className="container px-4 md:px-6 mx-auto">
        {/* Main Content */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Why Choose Effideli?</h2>
          <div className="w-24 h-1 bg-primary mx-auto mb-6" />
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Experience the difference with our comprehensive home management solutions and dedicated team of
            professionals.
          </p>
        </div>

        {/* Reasons Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {reasons.map((reason, index) => (
            <div
              key={index}
              className="flex flex-col items-center text-center p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow"
            >
              <div className="mb-4 p-3 rounded-full bg-primary/10">{reason.icon}</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">{reason.title}</h3>
              <p className="text-gray-600">{reason.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

