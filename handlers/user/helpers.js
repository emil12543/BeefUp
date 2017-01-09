/**
 * @param user model
 * @param password
 * @param callback
 * @description Checks if the provided password is the same as the current user password.
 * @return user model
 * @throws Wrong password
 */
exports.verifyPassword = (user, password, callback) => {
    user.verifyPassword(password, (err, isMatch) => {
        if (err)
            return callback(err);

        if (!isMatch) // checks if the passwords are not the same
            return callback(new Error('Wrong password'));

        return callback(null, user);
    });
};

/**
 * @param user
 * @param callback
 * @description Checks if the provided user is staff.
 * @return user model
 * @throws Not staff
 */
exports.isStaff = (user, callback) => {
    if ((['waiter', 'barman', 'cook', 'cashier'].indexOf(user.role) == -1))
        return callback(new Error('Not staff'));

    return callback(null, user);
};