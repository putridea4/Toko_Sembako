var express = require('express');
var router = express.Router();
var http = require("http");
var fs = require("fs");
var fileUpload = require('express-fileupload');
var path = require('path');
var formidable = require("formidable");
const check = require('express-validator/check').check;
const validationResult = require('express-validator/check').validationResult;
var mv = require("mv");
var authentication_mdl = require('../middlewares/authentication');
var session_store;
/* GET sembako page. */

router.get('/',authentication_mdl.is_login, function(req, res, next) {
	req.getConnection(function(err,connection){
		var query = connection.query('SELECT * FROM sembako',function(err,rows)
		{
			if(err)
				var errornya  = ("Error Selecting : %s ",err );   
			req.flash('msg_error', errornya);   
			res.render('sembako/list',{title:"sembako",data:rows,session_store:req.session});
		});
         //console.log(query.sql);
     });
});

router.delete('/delete/(:id)',authentication_mdl.is_login, function(req, res, next) {
	req.getConnection(function(err,connection){
		var sembako = {
			id: req.params.id,
		}
		
		var delete_sql = 'delete from sembako where ?';
		req.getConnection(function(err,connection){
			var query = connection.query(delete_sql, sembako, function(err, result){
				if(err)
				{
					var errors_detail  = ("Error Delete : %s ",err);
					req.flash('msg_error', errors_detail); 
					res.redirect('/sembako');
				}
				else{
					req.flash('msg_info', 'Delete sembako Success'); 
					res.redirect('/sembako');
				}
			});
		});
	});
});
router.get('/edit/(:id)',authentication_mdl.is_login, function(req,res,next){
	req.getConnection(function(err,connection){
		var query = connection.query('SELECT * FROM sembako where id='+req.params.id,function(err,rows)
		{
			if(err)
			{
				var errornya  = ("Error Selecting : %s ",err );  
				req.flash('msg_error', errors_detail); 
				res.redirect('/sembako'); 
			}else
			{
				if(rows.length <=0)
				{
					req.flash('msg_error', "sembako can't be find!"); 
					res.redirect('/sembako');
				}
				else
				{	
					console.log(rows);
					res.render('sembako/edit',{title:"Edit ",data:rows[0],session_store:req.session});

				}
			}

		});
	});
});
router.put('/edit/(:id)',authentication_mdl.is_login, function(req,res,next){
	req.assert('nama_barang', 'Please fill Nama Barang').notEmpty();
	var errors = req.validationErrors();
	if (!errors) {
		v_nama_barang = req.sanitize( 'nama_barang' ).escape().trim(); 
		v_kode = req.sanitize( 'kode' ).escape().trim();
		v_harga = req.sanitize( 'harga' ).escape().trim();
		v_stok = req.sanitize( 'stok' ).escape().trim();
		v_kategori = req.sanitize( 'kategori' ).escape().trim();

		if (!req.files) {
			var sembako = {
				nama_barang: v_nama_barang,
				kode: v_kode,
				harga: v_harga,
				stok: v_stok,
				kategori: v_kategori,
			};
		  }else{
			var file = req.files.gambar;
			var gambar = file.name;
			file.mimetype == "image/jpeg";
			file.mv("public/images/upload/" + file.name);
	
			var sembako = {
				nama_barang: v_nama_barang,
				kode: v_kode,
				harga: v_harga,
				stok: v_stok,
				kategori: v_kategori,
				gambar: gambar
			}
		}

		var update_sql = 'update sembako SET ? where id = '+req.params.id;
		req.getConnection(function(err,connection){
			var query = connection.query(update_sql, sembako, function(err, result){
				if(err)
				{
					var errors_detail  = ("Error Update : %s ",err );   
					req.flash('msg_error', errors_detail); 
					res.render('sembako/edit', 
					{ 
						nama_barang: req.param('nama_barang'), 
						kode: req.param('kode'),
						harga: req.param('harga'),
						stok: req.param('stok'),
						kategori: req.param('kategori'),
						gambar: req.param('gambar'),
					});
				}else{
					req.flash('msg_info', 'Update sembako success'); 
					res.redirect('/sembako');
				}		
			});
		});
	}else{

		console.log(errors);
		errors_detail = "<p>Sory there are error</p><ul>";
		for (i in errors) 
		{ 
			error = errors[i]; 
			errors_detail += '<li>'+error.msg+'</li>'; 
		} 
		errors_detail += "</ul>"; 
		req.flash('msg_error', errors_detail); 
		res.redirect('/sembako');
	}
});

router.post('/add',authentication_mdl.is_login, function(req, res, next) {
	req.assert('nama_barang', 'Please fill Nama Barang').notEmpty();
	var errors = req.validationErrors();
	if (!errors) {

		v_nama_barang = req.sanitize( 'nama_barang' ).escape().trim(); 
		v_kode = req.sanitize( 'kode' ).escape().trim();
		v_harga = req.sanitize( 'harga' ).escape().trim();
		v_stok = req.sanitize( 'stok' ).escape().trim();
		v_kategori = req.sanitize( 'kategori' ).escape();

		var file = req.files.gambar;
		var gambar = file.name;
        file.mimetype == "image/jpeg";
        file.mv("public/images/upload/" + file.name);

		var sembako = {
			nama_barang: v_nama_barang,
			kode: v_kode,
			harga: v_harga,
			stok : v_stok,
			kategori : v_kategori,
			gambar: gambar,
		}

		var insert_sql = 'INSERT INTO sembako SET ?';
		req.getConnection(function(err,connection){
			var query = connection.query(insert_sql, sembako, function(err, result){
				if(err)
				{
					var errors_detail  = ("Error Insert : %s ",err );   
					req.flash('msg_error', errors_detail); 
					res.render('sembako/add-sembako', 
					{ 
						nama_barang: req.param('nama_barang'), 
						kode: req.param('kode'),
						harga: req.param('harga'),
						stok: req.param('stok'),
						kategori: req.param('kategori'),
						gambar:req.param("gambar"),
						session_store:req.session,
					});
				}else{
					req.flash('msg_info', 'Create sembako success'); 
					res.redirect('/sembako');
				}		
			});
		});
	}else{

		console.log(errors);
		errors_detail = "<p>Sory there are error</p><ul>";
		for (i in errors) 
		{ 
			error = errors[i]; 
			errors_detail += '<li>'+error.msg+'</li>'; 
		} 
		errors_detail += "</ul>"; 
		req.flash('msg_error', errors_detail); 
		res.render('sembako/add-sembako', 
		{ 
			nama_barang: req.param('nama_barang'), 
			kode: req.param('kode'),
			session_store:req.session
		});
	}

});

router.get('/add',authentication_mdl.is_login, function(req, res, next) {
	res.render(	'sembako/add-sembako', 
	{ 
		title: 'Add New Nama Barang',
		nama_barang: '',
		kode: '',
		harga:'',
		stok:'',
		kategori:'',
		session_store:req.session
	});
});

module.exports = router;
