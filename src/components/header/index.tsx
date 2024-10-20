import Link from "next/link";

type Props = {};

const Header = (props: Props) => {
    return (
        <header className="h-16 w-full bg-white shadow-md sticky top-0 z-10">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex">
                        <div className="flex-shrink-0 flex items-center">
                            <Link href="/" className="flex items-center">
                                <svg
                                    className="h-8 w-8 text-black"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                    />
                                </svg>
                                <span className="ml-2 text-xl font-bold">InterfaceX</span>
                            </Link>
                        </div>
                    </div>
                    {/* <nav className="flex items-center">
                        <Link
                            href="/"
                            className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                        >
                            Home
                        </Link>
                        <Link
                            href="/about"
                            className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                        >
                            About
                        </Link>
                    </nav> */}
                </div>
            </div>
        </header>
    );
};

export default Header;
