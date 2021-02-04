const mycon = require('../util/conn');
const jwt = require('jsonwebtoken');
var dateFormat = require('dateformat');

exports.rES = (str) => {
    str = str + "";
    return str.toString().replace(/[\0\x08\x09\x1a\n\r"'\\\%]/g, function (char) {
        switch (char) {
            case "\0":
                return "\\0";
            case "\x08":
                return "\\b";
            case "\x09":
                return "\\t";
            case "\x1a":
                return "\\z";
            case "\n":
                return "\\n";
            case "\r":
                return "\\r";
            case "\"":
            case "'":
            case "\\":
            case "%":
                return "\\" + char; // prepends a backslash to backslash, percent,
            // and double/single quotes
        }
    });
}

exports.getAllUsers = (req, res, next) => {
    try {
        mycon.execute("select * from user",
            (error, rows, fildData) => {
                if (!error) {
                    res.send(rows);
                }
            });
    } catch (error) {
        console.log(error);
        res.status(500).send(error);
    }
}

exports.getDistric = (req, res, next) => {
    try {
        mycon.execute("SELECT distric.iddistric,distric.distric_sinhala,distric.distric_english,distric.distric_status FROM distric",
            (error, rows, fildData) => {
                if (!error) {
                    res.send(rows);
                }
            });
    } catch (error) {
        console.log(error);
        res.status(500).send(error);
    }
}

exports.getCitys = (req, res, next) => {
    try {
        mycon.execute("SELECT city.idcity,city.city_sinhala,city.city_english,city.distric_iddistric FROM city WHERE city.distric_iddistric=" + req.body.id,
            (error, rows, fildData) => {
                if (!error) {
                    res.send(rows);
                } else {
                    console.log(error);
                }
            });
    } catch (error) {
        console.log(error);
        res.status(500).send(error);
    }
}

exports.signUp = (req, res, next) => {
    try {

        let day = dateFormat(new Date(), "yyyy-mm-dd HH:MM:ss");

        mycon.execute("INSERT INTO `user`( `user_fullname`, `user_mobile`, `user_email`, `user_pword`, `user_status`, `user_address`, `user_type_iduser_type`, `distric`) " +
            " VALUES ( '" + this.rES(req.body.fname) + "', '" + this.rES(req.body.mobile) + "', '" + this.rES(req.body.email) + "', '" + this.rES(req.body.pword) + "', '0', '" + this.rES(req.body.address) + "', 3, " + this.rES(req.body.did) + ")",
            (error, rows, fildData) => {         
                let uid = rows.insertId;           
                if (!error) {
                    mycon.execute("SELECT tree.idTree,tree.parent,tree.layer,tree.userId,tree.`status` FROM tree WHERE tree.idTree=" + req.body.ref, (e, r, f) => {
                        if (!e) {
                            let l = r[0].layer;
                            l = l + 1;
                            mycon.execute("INSERT INTO  `tree` (  `parent`, `layer`, `userId`, `status`, `created`) " +
                                " VALUES	(" + req.body.ref + ", " + l + ", " + uid + ", 0, '" + day + "' );", (ee, rr, ff) => {
                                    if (!ee) {
                                        res.send(rows);
                                    } else {
                                        console.log(ee);
                                        res.status(500).send(ee);
                                    }
                                });
                        } else {
                            console.log(e);
                            res.status(500).send(e);
                        }
                    });

                } else {
                    console.log(error);
                    res.status(500).send(error);
                }
            });
    } catch (error) {
        console.log(error);
        res.status(500).send(error);
    }
}

exports.login = (req, res, next) => {

    try {
        mycon.execute("SELECT `user`.user_pword,`user`.user_email,`user`.iduser,user_type.iduser_type,user_type.user_type_name,user_type.user_type_description, `user`.user_fullname, `user`.user_mobile FROM `user` INNER JOIN user_type ON `user`.user_type_iduser_type=user_type.iduser_type WHERE `user`.user_email= '" + req.body.email + "'",
            (error, rows, fildData) => {
                if (!error) {
                    if (rows[0] != null) {

                        let uid = rows[0].iduser;
                        let pword = req.body.pword;
                        if (pword == rows[0].user_pword) {
                            let obj = {
                                uid: uid,
                                email: req.body.email,
                                utypeid: rows[0].iduser_type,
                                utypename: rows[0].user_type_name,
                                uname: rows[0].user_fullname,
                                mobile: rows[0].user_mobile
                            }
                            const token = jwt.sign(obj, process.env.JWT_KEY, { expiresIn: "1h" });
                            return res.status(200).json({
                                message: "Auth Successfull",
                                token: token
                            });
                        } else {
                            return res.status(401).json({ message: 'password is wrong' });
                        }
                    } else {
                        return res.status(401).json({ message: 'user name wrong' });
                    }
                } else {
                    console.log(error);
                    res.status(500).send(error);
                }
            });
    } catch (error) {
        console.log(error);
        res.status(500).send(error);
    }
}