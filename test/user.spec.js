const Code = require('code');
const expect = Code.expect;
const Lab = require('lab');
const lab = exports.lab = Lab.script();

const describe = lab.describe;
const it = lab.it;

const server = require('../config/server');

describe('unit tests - users', () => {
    let tokens = [];

    it('should add new user', done => {
        server.inject({
            method: 'POST',
            url: '/api/v0/auth/signup',
            payload: {
                username: 'user',
                password: '12345678',
                name: {
                    first: 'first',
                    last: 'last'
                },
                email: 'user@beefup.eu',
                role: 'owner'
            }
        }, response => {
            expect(response.statusCode).to.equal(200);
            done();
        });
    });

    it('should login', done => {
        server.inject({
            method: 'POST',
            url: '/api/v0/auth/login',
            payload: {
                username: 'user',
                password: '12345678'
            }
        }, response => {
            expect(response.statusCode).to.equal(200);
            expect(response.result.token).to.be.a.string();
            tokens[0] = response.result.token;
            done();
        });
    });

    it('should fail login with wrong username', done => {
        server.inject({
            method: 'POST',
            url: '/api/v0/auth/login',
            payload: {
                username: 'wrongusername',
                password: '12345678'
            }
        }, response => {
            expect(response.statusCode).to.equal(401);
            expect(response.result.message).to.equal('Wrong username or password');
            done();
        });
    });

    it('should fail login with wrong password', done => {
        server.inject({
            method: 'POST',
            url: '/api/v0/auth/login',
            payload: {
                username: 'user',
                password: 'wrongpassword'
            }
        }, response => {
            expect(response.statusCode).to.equal(401);
            expect(response.result.message).to.equal('Wrong password');
            done();
        });
    });

    it('should update an user', done => {
        server.inject({
            method: 'PUT',
            url: '/api/v0/users',
            headers: {
                'Authorization' : tokens[0]
            },
            payload: {
                currentPassword: '12345678',
                username: 'user1',
                password: '87654321',
                name: {
                    first: 'user1',
                    last: 'user1'
                },
                email: 'user1@beefup.eu'
            }
        }, response => {
            expect(response.statusCode).to.equal(200);
            done();
        });
    });

    it('should login for a second time', done => {
        server.inject({
            method: 'POST',
            url: '/api/v0/auth/login',
            payload: {
                username: 'user1',
                password: '87654321'
            }
        }, response => {
            expect(response.statusCode).to.equal(200);
            expect(response.result.token).to.be.a.string();
            tokens[1] = response.result.token;
            done();
        });
    });

    it('should revoke the second token', done => {
        server.inject({
            method: 'POST',
            url: '/api/v0/auth/revoke',
            headers: {
                'Authorization' : tokens[0]
            },
            payload: {
                token: tokens[1]
            }
        }, response => {
            expect(response.statusCode).to.equal(200);
            done();
        });
    });

    it('should return error username is already taken', done => {
        server.inject({
            method: 'POST',
            url: '/api/v0/auth/signup',
            payload: {
                username: 'user1',
                password: '12345678',
                name: {
                    first: 'user',
                    last: 'user'
                },
                email: 'user@beefup.eu'
            }
        }, response => {
            expect(response.statusCode).to.equal(422);
            expect(response.result.message).to.equal('This username is already taken');
            done();
        });
    });

    it('should return error there is user with this email', done => {
        server.inject({
            method: 'POST',
            url: '/api/v0/auth/signup',
            payload: {
                username: 'user',
                password: '12345678',
                name: {
                    first: 'user',
                    last: 'user'
                },
                email: 'user1@beefup.eu'
            }
        }, response => {
            expect(response.statusCode).to.equal(422);
            expect(response.result.message).to.equal('There is already a user with this email');
            done();
        });
    });

    let restaurant;

    it('should add new restaurant', done => {
        server.inject({
            method: 'POST',
            url: '/api/v0/restaurants',
            headers: {
                'Authorization' : tokens[0]
            },
            payload: {
                name: 'restaurant1',
                location: {
                    address: 'ul. Spartak 1, Blagoevgrad, Bulgaria'
                }
            }
        }, response => {
            expect(response.statusCode).to.equal(200);
            restaurant = response.result;
            done();
        })
    });

    it('should update a restaurant', done => {
        server.inject({
            method: 'PUT',
            url: '/api/v0/restaurants/' + restaurant._id,
            headers: {
                'Authorization' : tokens[0]
            },
            payload: {
                location: {
                    address: 'bul. Vasil Levski 1, Blagoevgrad, Bulgaria'
                }
            }
        }, response => {
            expect(response.statusCode).to.equal(200);
            done();
        })
    });

    it('should get a restaurant', done => {
        server.inject({
            method: 'GET',
            url: '/api/v0/restaurants/' + restaurant._id,
            headers: {
                'Authorization' : tokens[0]
            }
        }, response => {
            expect(response.statusCode).to.equal(200);
            done();
        })
    });

    it('should get all restaurants', done => {
        server.inject({
            method: 'GET',
            url: '/api/v0/restaurants',
            headers: {
                'Authorization' : tokens[0]
            }
        }, response => {
            expect(response.statusCode).to.equal(200);
            done();
        })
    });

    let category;

    it('should add new meal category', done => {
        server.inject({
            method: 'POST',
            url: '/api/v0/restaurants/' + restaurant._id + '/meals',
            headers: {
                'Authorization' : tokens[0]
            },
            payload: {
                title: 'Salads'
            }
        }, response => {
            expect(response.statusCode).to.equal(200);
            category = response.result;
            done();
        })
    });

    it('should update meal category', done => {
        server.inject({
            method: 'PUT',
            url: '/api/v0/restaurants/' + restaurant._id + '/meals/' + category._id,
            headers: {
                'Authorization' : tokens[0]
            },
            payload: {
                title: 'UpdatedSalads'
            }
        }, response => {
            expect(response.statusCode).to.equal(200);
            category = response.result;
            done();
        })
    });

    it('should get all meal categories', done => {
        server.inject({
            method: 'GET',
            url: '/api/v0/restaurants/' + restaurant._id + '/meals',
            headers: {
                'Authorization' : tokens[0]
            }
        }, response => {
            expect(response.statusCode).to.equal(200);
            expect(response.result).to.be.array();
            done();
        })
    });

    it('should remove meal category', done => {
        server.inject({
            method: 'DELETE',
            url: '/api/v0/restaurants/' + restaurant._id + '/meals/' + category._id,
            headers: {
                'Authorization' : tokens[0]
            }
        }, response => {
            expect(response.statusCode).to.equal(200);
            done();
        })
    });

    let user;

    it('should add new staff', done => {
        server.inject({
            method: 'POST',
            url: '/api/v0/staff',
            headers: {
                'Authorization' : tokens[0]
            },
            payload: {
                username: 'staff',
                name: {
                    first: 'staff',
                    last: 'staff'
                },
                email: 'staff@beefup.com',
                restaurant_id: restaurant._id,
                role: 'waiter'
            }
        }, response => {
            expect(response.statusCode).to.equal(200);
            user = response.result;
            done();
        })
    });

    it('should update staff', done => {
        server.inject({
            method: 'PUT',
            url: '/api/v0/staff/' + user._id,
            headers: {
                'Authorization' : tokens[0]
            },
            payload: {
                username: 'staff1',
                password: 'true'
            }
        }, response => {
            expect(response.statusCode).to.equal(200);
            done();
        })
    });

    it('should get staff', done => {
        server.inject({
            method: 'GET',
            url: '/api/v0/staff/' + user._id,
            headers: {
                'Authorization' : tokens[0]
            }
        }, response => {
            expect(response.statusCode).to.equal(200);
            user = response.result;
            done();
        })
    });
});