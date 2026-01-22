export default function KitchenHackMondayPage() {
  return (
    <div className="container mx-auto py-16 px-4">
      <h1 className="text-3xl md:text-4xl font-bold mb-6 text-center">
        Kitchen Hacks Monday
      </h1>
      <p className="text-lg text-gray-700 max-w-2xl mx-auto text-center mb-8">
        Kitchen Hacks Monday is an Effideli brand program that shares tips to
        make cooking fun, flavorful, and educational, adding value to your
        home—tune in every Monday on social media and the Effideli website.
      </p>
      <div className="text-center">
        <span className="inline-block bg-primary text-white px-4 py-2 rounded-full font-semibold">
          Coming Soon: Weekly Kitchen Tips!
        </span>
      </div>

      {/* Video Thumbnails Section */}
      <section className="mt-16">
        <h2 className="text-2xl font-bold mb-8 text-center text-primary">
          Watch Recent Episodes
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* Video 1 */}
          <div className="aspect-w-16 aspect-h-12 rounded-2xl overflow-hidden shadow-xl bg-gray-100">
            <iframe
              src="https://www.youtube.com/embed/dQw4w9WgXcQ"
              title="Episode 1"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full h-full"
            ></iframe>
          </div>
          {/* Video 2 */}
          <div className="aspect-w-16 aspect-h-12 rounded-2xl overflow-hidden shadow-xl bg-gray-100">
            <iframe
              src="https://www.youtube.com/embed/9bZkp7q19f0"
              title="Episode 2"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-[400px] h-[200px]"
            ></iframe>
          </div>
          {/* Video 3 */}
          <div className="aspect-w-16 aspect-h-12 rounded-2xl overflow-hidden shadow-xl bg-gray-100">
            <iframe
              src="https://www.youtube.com/embed/3JZ_D3ELwOQ"
              title="Episode 3"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full h-full"
            ></iframe>
          </div>
        </div>
        <div className="flex justify-center">
          <button className="bg-primary text-white font-semibold px-8 py-3 rounded-lg shadow-md hover:bg-primary/90 transition-all duration-300 text-lg">
            Watch More Episodes
          </button>
        </div>
      </section>
    </div>
  );
}
