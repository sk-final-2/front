import Link from "next/link";

type HeaderProp = {
  session: string;
};

const Header = ({ props }: { props: HeaderProp }) => {
  // TODO: Login session 받아오는 로직 추가
  const session = false;
  if (props?.session) {
    console.log("session is alive!!");
  }

  return (
    <header className="bg-white text-black p-4 shadow-xl">
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/" className="text-xl font-bold">
          Logo
        </Link>
        {session ? (
          <nav>
            <ul className="flex space-x-4">
              <li>
                <Link href="/login" className="hover:text-gray-300">
                  Login
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-gray-300">
                  Contact
                </Link>
              </li>
            </ul>
          </nav>
        ) : (
          <nav>
            <ul className="flex space-x-4">
              <li>
                <Link
                  href="/login"
                  className="text-red-500 hover:text-gray-300"
                >
                  Logout
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-gray-300">
                  Contact
                </Link>
              </li>
            </ul>
          </nav>
        )}
      </div>
    </header>
  );
};

export default Header;
