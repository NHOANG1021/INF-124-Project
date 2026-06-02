//Helper funcion checking if row exists in database

function handleNotFound(result, res, resourceName) {
  if (result.rowsAffected[0] === 0) {
    res.status(404).json({
      message: `${resourceName} not found`
    });

    return true;
  }

  return false;
}

module.exports = handleNotFound;