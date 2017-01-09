const Restaurant = require('../restaurant');

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

/**
 * @param staff
 * @param owner_id
 * @param callback
 * @description Check if the restaurant where the staff works belongs to the provided owner
 */
exports.checkStaffRestaurantOwnership = (staff, owner_id, callback) => {
    Restaurant.findById(staff.restaurant_id, owner_id, err => {
        if (err)
            return callback(err);

        return callback(null, staff);
    });
};