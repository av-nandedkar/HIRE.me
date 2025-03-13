import React, { useState } from 'react';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

const Register = () => {
  const [formData, setFormData] = useState({
    userType: '',
    name: '',
    email: '',
    password:'',
    phone: '',
    // profilePicture: null,
    location: '',
    pinCode: '',
    skills: '',
    // expectedPay: '',
    companyName: '',
    // budgetRange: '',
  });

  const [step, setStep] = useState(1);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');

  const skillOptions = [
  // Existing Skills
  'Plumber', 'Electrician', 'Carpenter', 'Mason', 'Welder', 'Painter',
  'Tailor', 'Mechanic', 'Driver', 'Cook', 'Housekeeper', 'Security Guard',
  'Gardener', 'AC Technician', 'Beautician', 'Hairdresser', 'Barber',
  'Photographer', 'Event Planner', 'Fitness Trainer', 'Yoga Instructor',
  'Babysitter', 'Elderly Caregiver', 'Laundry Services', 'Glass Fitter',
  'Aluminum Fabricator', 'Tiler', 'Roofer', 'Furniture Assembler',

  // Agricultural & Farming Workers
  'Farmer', 'Dairy Farmer', 'Poultry Farmer', 'Fisherman', 'Beekeeper',
  'Sericulturist (Silk Farming)', 'Organic Farming Expert', 'Irrigation Technician',
  'Seed Collector', 'Farm Equipment Operator', 'Crop Harvester', 'Tea Plantation Worker',
  'Spice Farmer', 'Sugarcane Farmer', 'Coconut Harvester', 'Vermicomposting Expert',
  'Mushroom Cultivator', 'Vegetable Vendor', 'Fruit Picker', 'Agri-Labourer',

  // Animal Husbandry & Veterinary Services
  'Cattle Herder', 'Goat Rearer', 'Sheep Farmer', 'Pig Farmer', 'Poultry Vaccinator',
  'Horse Caretaker', 'Veterinary Assistant', 'Livestock Breeder', 'Dairy Product Processor',
  'Milk Collector', 'Camel Herder', 'Bull Tamer', 'Elephant Caretaker',

  // Construction & General Labor
  'Brick Kiln Worker', 'Road Construction Worker', 'Paver Installer',
  'Scaffolding Worker', 'Well Digger', 'Water Supply Technician', 'Painter',
  'Stone Breaker', 'Cement Mixer Operator', 'Demolition Worker', 'Drainage Worker',
  'Road Sweeper', 'Pipeline Worker', 'Roof Thatcher', 'House Repair Worker',

  // Mechanical & Electrical Trades
  'Auto Mechanic', 'Tractor Mechanic', 'Tyre Repair Technician', 'Bicycle Repair Technician',
  'Water Pump Mechanic', 'Generator Technician', 'Elevator Maintenance Worker',
  'Solar Panel Installer', 'Gas Stove Repair Technician', 'Mobile Repair Technician',
  'LED Bulb Maker', 'Battery Technician', 'Motor Winder', 'Electric Line Worker',

  // Wood, Metal & Manufacturing
  'Blacksmith', 'Locksmith', 'Iron Worker', 'Toy Maker', 'Foundry Worker',
  'Glass Fitter', 'Aluminum Fabricator', 'Metal Craftsman', 'Furniture Maker',
  'Saw Mill Worker', 'Wood Cutter', 'Goldsmith', 'Silversmith',

  // Textile & Tailoring
  'Handloom Weaver', 'Embroidery Artist', 'Wool Spinner', 'Fabric Dyer', 
  'Quilt Maker', 'Saree Weaver', 'Hand Block Printer', 'Jute Worker',

  // Handicrafts & Artisan Work
  'Potter', 'Bamboo Craftsman', 'Basket Maker', 'Toy Maker', 'Stone Carver',
  'Wood Sculptor', 'Jewelry Maker', 'Brass Worker', 'Leather Craftsman',
  'Cane Worker', 'Lacquer Worker', 'Bell Metal Artisan', 'Carpet Weaver',

  // Food Production & Processing
  'Bakery Worker', 'Pickle Maker', 'Papad Maker', 'Sweet Maker', 
  'Tea Stall Operator', 'Jaggery Maker', 'Spice Grinder', 'Rice Mill Worker',
  'Flour Mill Operator', 'Oil Extraction Worker', 'Street Food Vendor',
  'Tea Seller', 'Sugarcane Juice Seller', 'Coconut Water Seller',

  // Household & Utility Services
  'Water Filter Technician', 'Solar Panel Technician', 'Chimney Cleaner',
  'Domestic Helper', 'Pest Control Worker', 'Waste Collector', 'Laundry Worker',
  'Gardener', 'Caretaker', 'Maid', 'Car Washer', 'Watchman', 'Sweeper',
  'Garbage Collector', 'Drainage Cleaner',

  // Transportation & Vehicle Services
  'Truck Driver', 'Auto Rickshaw Driver', 'Cycle Rickshaw Driver', 'E-Rickshaw Driver',
  'Bullock Cart Operator', 'Tractor Driver', 'Courier Delivery Worker', 'Boat Operator',
  'Handcart Puller', 'Cab Driver', 'Bus Conductor', 'Railway Porter', 'Tempo Driver',

  // Waiters & Hospitality Staff
  'Waiter', 'Restaurant Helper', 'Tea Boy', 'Hotel Cleaner', 'Dishwasher',
  'Room Service Attendant', 'Bellboy', 'Catering Staff', 'Bartender',
  'Fast Food Worker', 'Street Vendor', 'Ice Cream Seller', 'Juice Vendor',

  // Retail & Market Trades
  'Street Vendor', 'Local Shopkeeper', 'Handcart Seller', 'Weekly Market Vendor',
  'Butcher', 'Fish Seller', 'Florist', 'Grain Trader', 'Kirana Store Owner',
  'Hawker', 'Vegetable Vendor', 'Handicraft Seller',

  // Beauty & Personal Care
  'Beautician', 'Hairdresser', 'Barber', 'Mehendi Artist', 'Tattoo Artist',
  'Ayurvedic Masseur', 'Nail Technician', 'Body Piercer',

  // Traditional Services & Entertainment
  'Folk Musician', 'Dancer', 'Puppeteer', 'Storyteller', 'Astrologer', 'Snake Charmer',
  'Temple Priest', 'Jatra Performer', 'Street Performer', 'Drummer', 'Fire Dancer',

  // Forest & Natural Resource Workers
  'Charcoal Maker', 'Rubber Tapper', 'Woodcutter', 'Herbal Medicine Collector',
  'Honey Collector', 'Bamboo Harvester', 'Lac Collector', 'Salt Maker',
  'Coal Miner', 'Pearl Diver',

  // Miscellaneous & Rural Specialties
  'Rope Maker', 'Net Maker', 'Weighing Scale Operator', 'Herbal Medicine Collector',
  'Rural Courier Service Worker', 'Grain Mill Worker', 'Broom Maker', 'Palm Leaf Weaver',

  // New & Emerging Rural Jobs
  'Digital Banking Agent (Aadhaar-enabled services)', 'E-Governance Assistant',
  'SHG (Self-Help Group) Coordinator', 'Agri-Tech Assistant', 'Rural BPO Worker',
  'Cold Storage Worker', 'E-Commerce Delivery Agent'
];

  

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;
    if (type === 'file') {
      setFormData({ ...formData, [name]: files[0] });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
    validatePassword(e.target.value);
  };

  const handleConfirmPasswordChange = (e) => {
    setConfirmPassword(e.target.value);
  };

  const validatePassword = (password) => {
    const strongPasswordRegex = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%?&])[A-Za-z\d@$!%?&]{8,}$/;
    if (!strongPasswordRegex.test(password)) {
      setPasswordError('Password must be at least 8 characters long and include uppercase, lowercase, number, and special character.');
    } else {
      setPasswordError('');
    }
  };

  const handleSubmit = () => {
    if (!formData.userType) {
      alert('Please select how you want to use HIRE.me');
      return;
    }
    if (!formData.name) {
      alert('Full Name is required.');
      return;
    }
    if (!formData.email) {
      alert('Email is required.');
      return;
    }
    if (!password) {
      alert('Password is required.');
      return;
    }
    if (!confirmPassword) {
      alert('Confirm Password is required.');
      return;
    }
    if (password !== confirmPassword) {
      alert('Passwords do not match!');
      return;
    }
    if (passwordError) {
      alert(passwordError);
      return;
    }
    if (!formData.phone) {
      alert('Phone number is required.');
      return;
    }
    if (!formData.location) {
      alert('Location is required.');
      return;
    }
    if (!formData.pinCode) {
      alert('Pin Code is required.');
      return;
    }
  
    if (formData.userType === 'seeker' && !formData.skills) {
      alert('Please select your skill.');
      return;
    }
  
    setFormData({ ...formData, password });
  
    if (window.confirm('Are you sure you want to submit the form?')) {
      console.log('Form submitted:', formData);
      alert('Registration successful!');
    }
  };
  

//   const handleSubmit = () => {
//     if (window.confirm('Are you sure you want to submit the form?')) {
//       console.log('Form submitted:', formData);
//       alert('Registration successful!');
//     }
//   };

  return (
    <div className="flex items-center px-8 justify-center min-h-screen bg-gray-900">
<div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md sm:max-w-lg md:max-w-xl lg:max-w-2xl xl:max-w-3xl">
<div className="flex justify-center mb-4">
         <a href='/'> <img src="/HIRE.me-blue.png" alt="HIRE.me Logo" className="h-12" /></a>
        </div>
     
        <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">Join HIRE.me Today</h2>

       <>   <p className="text-gray-600 text-sm text-center mt-4">
  <strong>Already a Member?</strong> <a href="/login" className="text-blue-400 hover:underline"><strong>Sign In here</strong></a>
</p>

        
        <div className="flex items-center my-4">
          <hr className="flex-grow border-gray-600" />
          <span className="text-gray-700 px-2">or</span>
          <hr className="flex-grow border-gray-600" />
        </div></>


        {step === 1 && (
          <>

        {/* User Type */}
        <label className="block text-gray-600 mb-2">How do you want to use HIRE.me?</label>
        <select name="userType" className="w-full px-3 py-1 bg-gray-100 text-black rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-300" value={formData.userType} onChange={handleChange}>
          <option value="">Choose an option</option>
          <option value="provider">I need to hire someone</option>
          <option value="seeker">I'm looking for work</option>
        </select>

        {/* Name, Email, Phone */}
        <div className="mt-4">
        <label className="block text-gray-600">
  Full Name <span className="text-red-500">*</span>
</label>
          <input type="text" name="name" className="w-full px-3 py-1 bg-gray-100 text-black rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-300" value={formData.name} onChange={handleChange} />
        </div>

        <div className="mt-4">
          <label className="block text-gray-600">Email<span className="text-red-500">*</span></label>
          <input type="email" name="email" className="w-full px-3 py-1 bg-gray-100 text-black rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-300" value={formData.email} onChange={handleChange} />
        </div>
        <div className="mt-4 flex justify-between">
              <button onClick={() => setStep(2)}className="bg-gray-800 text-white py-2 px-4 rounded-3xl">Next</button>
            </div>

        </>  
     )} 

        {step === 2 && (
          <>

        {/* Password */}
        <div className="mt-4 relative">
          <label className="block text-gray-600">Password<span className="text-red-500">*</span></label>
          <input 
            type={showPassword ? 'text' : 'password'} 
            className="w-full px-3 py-1 bg-gray-100 text-black rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-300" 
            value={password} 
            onChange={handlePasswordChange} 
            placeholder="Enter strong password"
          />
          <span className="absolute right-3 top-10 cursor-pointer" onClick={() => setShowPassword(!showPassword)}>
            {showPassword ? <FaEyeSlash /> : <FaEye />}
          </span>
          {passwordError && <p className="text-red-500 text-sm mt-1">{passwordError}</p>}
        </div>

        {/* Confirm Password */}
        <div className="mt-4 relative">
          <label className="block text-gray-600">Confirm Password<span className="text-red-500">*</span></label>
          <input 
            type={showConfirmPassword ? 'text' : 'password'} 
            className="w-full px-3 py-1 bg-gray-100 text-black rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-300" 
            value={confirmPassword} 
            onChange={handleConfirmPasswordChange} 
            placeholder="Confirm your password"
          />
          <span className="absolute right-3 top-10 cursor-pointer" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
            {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
          </span>
        </div>
        <div className="mt-4 flex justify-between">
              <button onClick={() => setStep(1)} className="bg-gray-400 text-white py-1 px-4 rounded-3xl hover:bg-gray-800 transition cursor-pointer">«</button>
              <button onClick={() => setStep(3)}className="bg-gray-800 text-white py-2 px-4 rounded-3xl ">Next</button>
            </div>

</>   )} 

{step === 3 && (
          <>
        <div className="mt-4">
          <label className="block text-gray-600">Phone Number<span className="text-red-500">*</span></label>
          <input type="text" name="phone" className="w-full px-3 py-1 bg-gray-100 text-black rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-300" value={formData.phone} onChange={handleChange} />
        </div>

        {/* Location and Pin Code */}
        <div className="mt-4">
          <label className="block text-gray-600">Location<span className="text-red-500">*</span></label>
          <input type="text" name="location" className="w-full px-3 py-1 bg-gray-100 text-black rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-300" value={formData.location} onChange={handleChange} />
        </div>

        <div className="mt-4">
          <label className="block text-gray-600">Pin Code<span className="text-red-500">*</span></label>
          <input type="text" name="pinCode" className="w-full px-3 py-1 bg-gray-100 text-black rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-300" value={formData.pinCode} onChange={handleChange} />
        </div>

        {/* Work Seeker Fields */}
        {formData.userType === 'seeker' && (
          <>
            <div className="mt-4">
              <label className="block text-gray-600">Select Your Skill<span className="text-red-500">*</span></label>
              <input
                list="skills"
                name="skills"
                className="w-full px-3 py-1 bg-gray-100 text-black rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-300"
                value={formData.skills}
                onChange={handleChange}
                placeholder="Search or select a skill"
              />
              <datalist id="skills">
                {skillOptions.map((skill, index) => (
                  <option key={index} value={skill} />
                ))}
              </datalist>
            </div>

            {/* <div className="mt-4">
              <label className="block text-gray-600">Expected Pay</label>
              <input type="text" name="expectedPay" className="w-full px-3 py-1 bg-gray-100 text-black rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-300" value={formData.expectedPay} onChange={handleChange} placeholder="Enter salary expectations" />
            </div> */}
          </>
        )}

        {/* Job Provider Fields */}
        {formData.userType === 'provider' && (
          <>
            <div className="mt-4">
              <label className="block text-gray-600">Company Name(Optional)</label>
              <input type="text" name="companyName" className="w-full px-3 py-1 bg-gray-100 text-black rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-300" value={formData.companyName} onChange={handleChange} />
            </div>

            {/* <div className="mt-4">
              <label className="block text-gray-600">Budget Range</label>
              <input type="text" name="budgetRange" className="w-full px-3 py-1 bg-gray-100 text-black rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-300" value={formData.budgetRange} onChange={handleChange} placeholder="Enter hiring budget" />
            </div> */}
          </>
        )}

        {/* Submit Button */}
        <div className="mt-4 flex justify-between">
              <button onClick={() => setStep(2)} className="bg-gray-400 text-white py-1 px-4 rounded-3xl hover:bg-gray-800 transition cursor-pointer">«</button>
              <button onClick={handleSubmit} className="bg-gray-800 text-white py-2 px-4 rounded-3xl hover:bg-blue-700 transition cursor-pointer ">Register</button>
            </div>

        </>
        )}
      </div>
    </div>
  );
};

export default Register;