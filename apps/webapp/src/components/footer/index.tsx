import { Icon } from "@iconify/react/dist/iconify.js";

type Props = {};

const Footer = (props: Props) => {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="w-full p-4 bg-gray-800 text-gray-300 mt-auto">
            <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                <div className="flex flex-col sm:flex-row justify-between items-center text-sm">
                    <div className="mb-2 sm:mb-0">
                        <p>&copy; {currentYear} Extrascan | ABI extrapolator</p>
                    </div>
                    <div className="flex space-x-4">
                        <a href="https://github.com/AjayiMike/extrascan" className="hover:text-white">
                            <Icon icon="uil:github" className="w-8 h-8" />
                        </a>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
