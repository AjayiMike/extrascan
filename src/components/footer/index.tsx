type Props = {};

const Footer = (props: Props) => {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="h-16 w-full bg-gray-800 text-gray-300 mt-auto">
            <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col sm:flex-row justify-between items-center text-sm">
                    <div className="mb-2 sm:mb-0">
                        <p>© {currentYear} InterfaceX | Open Source Dev Tool</p>
                    </div>
                    <div className="flex space-x-4">
                        <a href="#" className="hover:text-white">
                            GitHub
                        </a>
                        <a href="#" className="hover:text-white">
                            Docs
                        </a>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
