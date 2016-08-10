haraka-plugin-graveyard
=======================

Forward messages to another server for continued retry attempts after a
configured amount of DENYSOFT values are returned.


Configuration
-------------

  * `config/graveyard.ini` - configure max soft bounces before queued for graveyard

### Example

    ; config/graveyard.ini
    [graveyard]
    max_failures_before_graveyard = 2
    next_hop = 127.0.0.1:9025


Caveats
-------

You'll want the configured `max_failures_before_graveyard` value to be lower than the
`maxTempFailures` value in the `outbound.ini` file. Possibly much less -- if
the process is restarted, then the count of failures before sending to the
graveyard is reset, so a hard bounce may occur sooner than you expect in such
a situation.

Really, this plugin is intended to forward a message to a server that's dedicated
to retrying soft denies much longer than a machine with good standing should,
so setting the `maxTempFailures` to 13 (the default) and then setting
`max_failures_before_graveyard` to something like 1 or 2 would be perfectly
appropriate.
