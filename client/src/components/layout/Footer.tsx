export const Footer = () => {
  return (
    <footer className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 py-4 px-6 md:ml-64 z-40">
      <div className="container mx-auto flex flex-col md:flex-row justify-between items-center">
        <div className="text-sm text-gray-500 mb-2 md:mb-0">
          © {new Date().getFullYear()} BillMitra. All rights reserved.
        </div>
        <div className="flex space-x-4">
          <a 
            href="#" 
            className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
          >
            Terms
          </a>
          <a 
            href="#" 
            className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
          >
            Privacy
          </a>
          <a 
            href="#" 
            className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
          >
            Help
          </a>
        </div>
      </div>
    </footer>
  );
};
