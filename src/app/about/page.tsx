export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-md p-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-6">About Us</h1>
          
          <div className="prose prose-lg text-gray-700">
            <p className="mb-6">
              Welcome to Solscape, your premier destination for luxury villa rentals. 
              We specialize in curating exceptional vacation experiences through our 
              carefully selected portfolio of stunning villas worldwide.
            </p>
            
            <p className="mb-6">
              Our mission is to provide travelers with unforgettable stays in some of 
              the world's most beautiful locations. Each villa in our collection is 
              handpicked for its unique character, exceptional amenities, and 
              breathtaking surroundings.
            </p>
            
            <p className="mb-6">
              Whether you're seeking a beachfront escape, a mountain retreat, or an 
              urban sanctuary, we have the perfect villa to make your vacation dreams 
              come true.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
