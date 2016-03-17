(function () {
    angular.module('common').factory('appSession', [
            function () {

                var _session = {
                    user: null,
                    tenant: null,
                    userWarehouse: null,
                };

                abp.services.app.session.getCurrentLoginInformations({ async: false }).done(function (result) {
                    _session.user = result.user;
                    _session.tenant = result.tenant;
                    _session.userWarehouse = result.warehouse;
                });

                return _session;
            }
        ]);
})();