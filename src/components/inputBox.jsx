import { Search } from "lucide-react";

function InputBox({ placeString }) {
  return (
    <div style={{ position: "relative", width: "400px" }}>
      <input type="text" placeholder={placeString}
        style={{
          border: "none",
          padding: "7px 10px 5px 40px", 
          fontSize: "20px",
          borderRadius: "15px",
          width: "100%",
          outline: "none",
          backgroundColor: "#e2e4e7",
          fontWeight: "500"
        }}
      />
      <Search
        style={{
          position: "absolute",
          left: "12px",
          top: "50%",
          transform: "translateY(-50%)",
          color: "gray",
          width: "20px",
          height: "20px",
        }}
      />
    </div>
  );
}

export default InputBox;
