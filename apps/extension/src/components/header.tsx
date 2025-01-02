import { Icon } from "@iconify/react";
import logo from "../assets/logo.png";
const Header = ({ onBack }: { onBack?: () => void }) => {
    return (
        <div className="h-[90px] p-4 border-b">
            <div className="flex items-center gap-2 mb-1">
                {onBack && (
                    <button onClick={onBack} className="text-gray-600 hover:text-gray-800">
                        <Icon icon="carbon:arrow-left" className="w-5 h-5" />
                    </button>
                )}
                <img src={logo} alt="Extrascan Logo" className="w-6 h-6" />
                <h1 className="text-lg font-semibold">Extrascan</h1>
            </div>
            <p className="text-xs text-gray-600">Interact with unverified smart contracts right inside the explorer</p>
        </div>
    );
};

export default Header;
