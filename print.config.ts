/*
 *  Purpose: removes functionality from: console.{log|debug|count|dir|info|error|warn}
 *           statements - only within a production environment
 *
 *  Note:    This is a band-aid solution to the larger issue
 *           This solution should phased out in the future. - Bill
 */


if (import.meta.env.PROD) {
  console.log = function () {};
  console.debug = function () {};
  console.count = function () {};
  console.dir = function () {};
  console.info = function () {};
  console.error = function () {};
  console.warn = function () {};
}
