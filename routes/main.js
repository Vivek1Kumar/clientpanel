var router = require('express').Router();
var User = require('../models/user');
var Product = require('../models/product');
// var app = express();

Product.createMapping(function(err, mapping){
	if(err) {
		console.log('Error creating mapping...');
		console.log(err);
	}else{
		console.log("mapping created");
		console.log(mapping);
	}
});

var stream = Product.synchronize();
var count = 0; 
stream.on('data', function(){
	count++;
});

stream.on('close', function(){
	console.log("Indexed:" + count +  "documents");
});

stream.on('erroe', function(err){
	console.log(err);
});

router.get('/', function(req, res){
	res.render("main/home.ejs");
});

router.get('/about', function(req, res){
	res.render("main/about");
});

router.post('/search', function(req, res, next){
	res.redirect('/search?q=' + req.body.q);
});

router.get('/search', function(req, res, next){
	if(req.query.q){
		Product.search({
			query_string: { query: req.query.q}
		}, function(err, results){
			if(err) return next(err);
			var data = results.hits.hits.map(function(hit){
				return hit;
			});
			res.render('/main/search-result', {
				query: req.query.q,
				data: data
			});
		});
	}
});
// router.get('/users', function(req, res){
// 	User.find({}, function(err, users){
// 		res.json(users);
// 	})
// })
router.get('/products/:id', function(req, res, next){
	Product
		.find({ category: req.params.id })
		.populate('category')
		.exec(function(err, products){
			if(err) next(err);
			res.render('main/category', {
				products: products
			});
		});
});

// router.get('/products/:id', function(req, res, next){
// 	Product
// 		.findById({ _id: req.params.id }, function(err, next){
// 			if(err) return next(err);
// 			res.render('main/product', {
// 				products: products
// 			})
// 		})
// })

module.exports = router;