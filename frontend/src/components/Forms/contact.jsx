import React from "react";
import mail from "../../../assets/mail.png";
import phone from "../../../assets/phone.png";
import location from "../../../assets/location.png";
import Swal from "sweetalert2";

const Contact = () => {
  const [result, setResult] = React.useState("");

  const onSubmit = async (event) => {
    event.preventDefault();
    setResult("Sending....");
    const formData = new FormData(event.target);

    formData.append("access_key", "dce8220d-2078-4f19-8031-a0e334212bdc");

    const response = await fetch("https://api.web3forms.com/submit", {
      method: "POST",
      body: formData,
    });

    const data = await response.json();

    if (data.success) {
      Swal.fire({
        title: "Message Sent Successfully",
        text: "Thanks for reaching!",
        icon: "success",
      });
      event.target.reset();
    } else {
      console.log("Error", data);
      setResult(data.message);
    }
  };

  return (
    <div className="pt-30 bg-gray-900 text-white">
        <div className="absolute inset-0 bg-gradient-to-r from-black via-transparent to-black opacity-60" />
      <div id="contact" className="text-center text-4xl mb-5">
        <h1 className="text-4xl  mb-4">Contact Us</h1>
      </div>
      <div className="flex flex-col lg:flex-row justify-center items-center gap-20 py-12 px-6 ">
        <div className="flex flex-col lg:flex-row gap-20">
          <div className="flex flex-col gap-6 max-w-lg">
            <h1 className="text-3xl font-medium bg-clip-text text-transparent bg-[#ff347f]">
              Feel Free To Connect
            </h1>
            <p className="text-base text-white ">
              If you are facing any kind of technical issues from our HIRE.me or need help, feel free to reachout us. We are here to help you! Also we are open for the suggestions to improve our HIRE.me
            </p>
            <div className="flex flex-col gap-8 text-base">
              <div className="flex items-center gap-4">
                <img src={mail} alt="mail" className="w-8 h-8" />
                <p>hire.mesupport@gmail.com</p>
              </div>
              <div className="flex items-center gap-4">
                <img src={phone} alt="phone" className="w-8 h-8" />
                <p>+91- 1234567890</p>
              </div>
              <div className="flex items-center gap-4">
                <img src={location} alt="location" className="w-8 h-8" />
                <p>Maharashtra, India.</p>
              </div>
            </div>
            
          </div>
          <form
            onSubmit={onSubmit}
            className="flex flex-col gap-4 max-w-lg w-full"
          >
            <label htmlFor="name" className="text-lg">
              Your Name
            </label>
            <input
              type="text"
              placeholder="Enter your name"
              required
              name="name"
              className="w-full h-10 px-4 rounded-lg bg-gray-900 text-white transition-transform transform border border-gray-500 "
            />
            <label htmlFor="email" className="text-lg">
              Your Email
            </label>
            <input
              type="email"
              placeholder="Enter your email"
              required
              name="email"
              className="w-full h-10 px-4 rounded-lg bg-gray-900 text-white transition-transform transform border border-gray-500 "
            />
            <label htmlFor="message" className="text-lg">
              Your Message
            </label>
            <textarea
              name="message"
              required
              cols="30"
              rows="3"
              placeholder="Enter your message.."
              className="w-full h-32 px-4 py-2 rounded-lg bg-gray-900 text-white transition-transform transform border border-gray-500 "
            ></textarea>
            <button className="bg-[#ff347f] hover:bg-black transition cursor-pointer text-white px-6 py-3 rounded-3xl font-medium mt-4">
              Send Message
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Contact;
