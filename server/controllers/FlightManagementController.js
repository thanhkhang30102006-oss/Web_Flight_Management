const db = require("../models");
const Flight= db.FlightInformation;

const showAllFlight = async (req, res) =>{
    try {   
        
    
    const Flights = await Flight.findAll({
        order: [['departureDay', 'ASC'],
                ['departureTime', 'ASC']]

    });

    console.log("Kết quả tìm được:", JSON.stringify(Flights, null, 2));
    return res.status(200).json(Flights);
    
    }
    catch (error) {
        console.log( error);
        return res.status(500).json({message:  `Lỗi server: ${error} `});
    }
};

module.exports= {showAllFlight};