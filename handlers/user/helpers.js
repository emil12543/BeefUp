exports.verifyPassword = (user, password, callback) => {
    user.verifyPassword(password, (err, isMatch) => {
        if (err)
            return callback(err);

        if (!isMatch)
            return callback(new Error('Wrong password'));

        return callback(null, user);
    });
};

exports.isStaff = (user, callback) => {
    if ((['waiter', 'barman', 'cook', 'cashier'].indexOf(user.role) == -1))
        return callback(new Error('Not staff'));

    return callback(null, user);
};