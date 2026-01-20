export default function Footer() {
  return (
    <footer className="bg-gradient-to-r from-yellow-200 via-orange-200 to-pink-200 py-8 px-6 mt-12 shadow-inner">
      <div className="max-w-5xl mx-auto flex flex-col items-center text-gray-800 gap-6 text-center">

        {/* Club Info */}
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-orange-700 mb-1">
            Panchra Agragami Sangha
          </h2>
          <p className="text-sm md:text-base text-gray-700">Estd: 2008</p>
        </div>

        {/* Contact Person */}
        <div>
          <p className="text-sm md:text-base font-semibold text-gray-800 mb-1">
            Contact Person
          </p>
          <ul className="text-gray-700 space-y-1 text-xs md:text-sm">
            <li><strong>Name:</strong> Mr. Anupam Barat Sengupta</li>
            <li><strong>Position:</strong> President</li>
            <li><strong>Location:</strong> Panchra Dharmatala, Jamalpur, Burdwan</li>
            <li><strong>Phone:</strong> +91-8910490267</li>
          </ul>
        </div>

        {/* All Rights Reserved */}
        <div>
          <p className="text-xs md:text-sm text-gray-800">
            &copy; {new Date().getFullYear()} Panchra Agragami Sangha. All Rights Reserved.
          </p>
        </div>

      </div>
    </footer>
  );
}
