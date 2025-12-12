import Image from "next/image";

export default function WhyChooseUs() {
  const reasons = [
    {
      title: "Meal Plans Made for You",
      description:
        " Recipes that fit your family, your taste, and your schedule. Stree-free and super tasty!",
      icon: (
        <Image
          src="/images/Event.png"
          alt="Frying Pan Icon"
          width={48}
          height={48}
          className="h-12 w-12 object-contain"
        />
      ),
    },
    {
      title: "Kitchen Hacks & Tips",
      description:
        "Learn practical tips, techniques, and hacks that simplify cokking and elevate your culinary skills",
      icon: (
        <Image
          src="/images/Frying.png"
          alt="Event Accepted Tentatively Icon"
          width={48}
          height={48}
          className="h-12 w-12 object-contain"
        />
      ),
    },
    {
      title: "Flavour Meets Culture",
      description:
        "From global favorites to African-inspired dishes, we bring culture and excitement to every meal.",
      icon: (
        <Image
          src="/images/Chili Pepper.png"
          alt="Chili Pepper Icon"
          width={48}
          height={48}
          className="h-12 w-12 object-contain"
        />
      ),
    },
  ];

  return (
    <section className="py-16 bg-gray-50">
      <div className="container px-4 md:px-6 mx-auto">
        {/* Main Content */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Why Choose Effideli?
          </h2>
          <div className="w-24 h-1 bg-primary mx-auto mb-6" />
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Experience the difference with our comprehensive home management
            solutions and dedicated team of professionals.
          </p>
        </div>

        {/* Reasons Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {reasons.map((reason, index) => (
            <div
              key={index}
              className="flex flex-col items-center text-center p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow"
            >
              <div className="mb-4 p-3 rounded-full bg-primary/10">
                {reason.icon}
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                {reason.title}
              </h3>
              <p className="text-gray-600">{reason.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
