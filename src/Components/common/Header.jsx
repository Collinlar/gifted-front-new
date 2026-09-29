import { CgProfile } from "react-icons/cg";
import { Link, useNavigate } from "react-router-dom";
import { RiLogoutBoxLine } from "react-icons/ri";
import { A } from "../../lib/appTheme";

const Header = ({ title }) => {
	const navigate = useNavigate()
	const handleLogout = ()=>{
		localStorage.removeItem("token")
		localStorage.removeItem("user")
		localStorage.removeItem("state")
		localStorage.removeItem("purpose")
		localStorage.removeItem("performance")
		localStorage.removeItem("learning")
		localStorage.removeItem("interest")
		localStorage.removeItem("channel")
		localStorage.removeItem("id")
		localStorage.removeItem("channelName")
		localStorage.removeItem("channelId")
		localStorage.removeItem("grade")
		localStorage.removeItem("Invoice")
		localStorage.removeItem("Grade-Paid")
		localStorage.removeItem("Paid")
		localStorage.removeItem("login")
		navigate("/login")



	}
	// The bar was a half opacity black over a light page, which came out grey
	// and matched neither the sidebar nor the homepage. It is the navy now.
	return (
		<header className='backdrop-blur-md shadow-lg border-b' style={{ backgroundColor: A.navy, borderColor: A.navyDeep }}>
			<div className='max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 justify-between flex'>
				<h1 className='text-2xl font-semibold text-white'>{title}</h1>
				<div className="flex">

				<Link to="/user-details"><CgProfile className="text-white w-[50px] hover:cursor-pointer"/> </Link>
				<RiLogoutBoxLine className="text-white w-[50px] hover:cursor-pointer" onClick={handleLogout}/>
				</div>

			</div>
		</header>
	);
};
export default Header;
