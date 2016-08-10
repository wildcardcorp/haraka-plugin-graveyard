// graveyard
//
// forward messages to a graveyard server for continued send attempts after a
// configured amount of DENYSOFT values are returned.

// documentation via: haraka -c /opt/haraka -h plugins/graveyard

exports.register = function() {
  this.register_hook('deferred', 'graveyard_deferred');
  this.register_hook('get_mx', 'force_graveyard_routing', -10);
};


exports.graveyard_deferred = function(next, hmail, hook) {
  var plugin = this;
  plugin.load_graveyard_ini();

  var max_failures_before_graveyard = plugin.cfg.graveyard.max_failures_before_graveyard;
  if(isNaN(max_failures_before_graveyard) || !Number.isInteger(max_failures_before_graveyard)) {
    plugin.logerror(plugin, "'max_failures_before_graveyard' missing/NaN");
    return next();
  }

  // if failures have not reached the max allowed, just pass through
  if(hmail.num_failures <= max_failures_before_graveyard) {
    plugin.logdebug(plugin, "max_failures_before_graveyard not reached");
    return next();
  }
  plugin.loginfo(plugin, "max_failures_before_graveyard reached, marking message to be forwarded to graveyard");
  hmail.todo.notes.force_to_graveyard = true;
  return next();
};


exports.force_graveyard_routing = function(next, hmail, domain) {
  var plugin = this;

  var force_to_graveyard = hmail.todo.notes.force_to_graveyard || false;
  if(!force_to_graveyard) {
    plugin.logdebug(plugin, 'message NOT forced to graveyard');
    return next();
  }
  var next_hop = plugin.cfg.graveyard.next_hop;
  if(!next_hop) {
    plugin.logdebug(plugin, 'error loading graveyard config for next_hop');
    return next();
  }
  plugin.logdebug(plugin, 'sending message intended for ' + domain + ' to graveyard (' + next_hop + ')');
  return next(OK, next_hop);
}


exports.load_graveyard_ini = function() {
  var plugin = this;
  plugin.cfg = plugin.config.get(
    'graveyard.ini',
    'ini',
    function() {
      plugin.load_graveyard_ini();
    });
};
