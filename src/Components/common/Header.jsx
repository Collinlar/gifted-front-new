import { CgProfile } from "react-icons/cg";
import { Link, useNavigate } from "react-router-dom";
import { RiLogoutBoxLine } from "react-icons/ri";

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
	return (
		<header className='bg-black bg-opacity-50 backdrop-blur-md shadow-lg border-b border-black'>
			<div className='max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 justify-between flex'>
				<h1 className='text-2xl font-semibold text-gray-100'>{title}</h1>
				<div className="flex">

				<Link to="/user-details"><CgProfile className="text-white w-[50px] hover:cursor-pointer"/> </Link>
				<RiLogoutBoxLine className="text-white w-[50px] hover:cursor-pointer" onClick={handleLogout}/>
				</div>

			</div>
		</header>
	);
};
export default Header;
