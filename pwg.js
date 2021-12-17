characters =
{
    'lowercase': 'abcdefghijklmnopqrstuvwxyz'.split(''),
    'uppercase': 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split(''),
    'digits': '0123456789'.split(''),
    'symbols': ')!@#$%^&*('.split('')
}

function hash(str)
{
	var a = 0;
	for(c = str.length; c--;)
	{
		a += str.charCodeAt(c);
		a += a << 10;
		a ^= a >> 6;
	}
	a += a << 3;
	a ^= a >> 11;
	return (a + (a << 15) & 4294967295) >>> 0;
}

function wrap_round16(n)
{
	var o = n & 0xFFFF;
	while (n > 0)
	{
		n >>>= 0xF;
		o ^= n & 0xFFFF;
	}
	return o;
}

function gen()
{
	var conf = [document.getElementById("DN").value,document.getElementById("L").value,(document.getElementById("l").checked ? 1 : 0 + document.getElementById("u").checked ? 2 : 0 + document.getElementById("n").checked ? 4 : 0 + document.getElementById("s").checked ? 8 : 0)].join(',');
	
	var password = {
		'char_weights':
		[
			document.getElementById("l").checked ? 1 : 0,
			document.getElementById("u").checked ? 1 : 0,
			document.getElementById("n").checked ? 1 : 0,
			document.getElementById("s").checked ? 1 : 0
		],
		'allowed_chars':
		[
			characters.lowercase,
			characters.uppercase,
			characters.digits,
			characters.symbols
		],
		'length': document.getElementById("L").value,
		'seed': document.getElementById("P").value + conf,
		'string': ''
	}
	
	password = make(password);
	document.getElementById("out").innerHTML = password.string;
}

function make(pass)
{
	var total_weight = 0;
	for (var i = 0; i < pass.char_weights.length; i++)
		total_weight += pass.char_weights[i];
	
	if (total_weight == 0) return;
	
	var idx = []; var t = 0; var r = pass.length % total_weight;
	for (var i = 0; i < pass.char_weights.length; i++)
	{
		t += pass.char_weights[i];
		var w = Math.floor(pass.char_weights[i] / total_weight * pass.length);
		
		if (t <= r)
			w += pass.char_weights[i];
		
		for (var j = 0; j < w; j++)
			idx.push(i);
	}
	
	var str = pass.seed;
	pass.string = "";
	for (var i = 0; i < pass.length; i++)
	{
		var a = wrap_round16(hash(str));
		str = a.toString();
		var b = Math.floor((idx.length - 1) / 0xFFFF * a);
		
		a = wrap_round16(hash(str));
		str = a.toString();
		var c = Math.floor((pass.allowed_chars[idx[b]].length - 1) / 0xFFFF * a);
		
		pass.string += pass.allowed_chars[idx[b]][c];
		idx.splice(b,1);
	}
	
	return pass;
}
