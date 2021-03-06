const mercadopago = require('mercadopago');

mercadopago.configure({
    access_token: 'TEST-8124106770287819-111700-234c9da281bb7ed5a342c6fb8e1babe9-555929119'
});

module.exports = {
    async MP (req, res) {
        const { items } = req.body;
        try {
            let preference =  {
                items: 
                // items //aca deben llegar los items con el formato de abajo!
                [
                    {
                        title: 'ojotas',
                        unit_price: 1,
                        quantity: 1,
                    }
                ]
            }
            mercadopago.preferences.create(preference)
            .then(function(response){
                console.log(response)
                res.send({preferenceId: response.body.init_point.split('pref_id=')[1]});
                // Este valor reemplazará el string "<%= global.id %>" en tu HTML
                // global.id = response.body.id;
            }).catch(function(error){
                console.log(error);
            });

        } catch (err) {
            console.log(err);
            res.status(400).send({message: 'Something went wrong :('})
        }
    }
}

// class MercadopagoController {
//     async mercadopago({request}) {

//         //datos de la venta
//         let preference = {
//             items: [
//                 {
//                     title: 'ojotas',
//                     unit_price: 199,
//                     quantity: 1,
//                 }
//             ]
//         };

//         const res = await mercadopago.preferences.create(preference)

//         return res;
//     }
// }

// module.exports = MercadopagoController