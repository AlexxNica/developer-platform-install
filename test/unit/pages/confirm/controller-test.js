'use strict';

import chai, { expect } from 'chai';
import sinon from 'sinon';
import { default as sinonChai } from 'sinon-chai';
import Logger from 'browser/services/logger';
import Platform from 'browser/services/platform';
import ElectronMock from '../../../mock/electron';
import ConfirmController from 'browser/pages/confirm/controller';

import fs from 'fs';

require('../../../angular-test-helper');
require('browser/main');

chai.use(sinonChai);

describe('ConfirmController', function() {

  beforeEach(function() {
    sandbox.stub(Logger, 'getIpcRenderer').returns({send() {}});
  });

  afterEach(function() {
    sandbox.restore();
  });

  beforeEach(ngModule('devPlatInstaller'));

  let sandbox = sinon.sandbox.create();
  let electron = new ElectronMock();
  let $watch;
  let $controller;
  let $scope;
  let confirmController;
  let installerDataSvc;

  let context = function context(_$controller_, _$rootScope_, _$state_, _$timeout_, _installerDataSvc_) {
  // The injector unwraps the underscores (_) from around the parameter names when matching
    $controller = _$controller_;
    $scope = _$rootScope_.$new();
    $scope.$apply = function applyStub() {};
    $watch = sandbox.spy($scope, '$watch');
    installerDataSvc = _installerDataSvc_;
    sandbox.stub(installerDataSvc, 'copyUninstaller');
    sandbox.stub(fs, 'existsSync').returns(true);
    sandbox.spy(_$state_, 'go');
    installerDataSvc.setup();

    confirmController = $controller('ConfirmController', {
      $scope,
      $state: _$state_,
      $timeout: function timeoutStub(callback) { callback(); },
      installerDataSvc,
      electron
    });
  };

  describe('back', function() {
    beforeEach(function() {
      sandbox.stub(confirmController.router, 'go');
      confirmController.back();
    });

    it('navigates to selection page', function() {
      expect(confirmController.router.go).calledWith('selection');
    });
  });

  describe('exit', function() {
    it('exit closes active window', function() {
      sandbox.stub(electron.remote.currentWindow);
      confirmController.exit();
      expect(electron.remote.currentWindow.close).calledOnce;
    });
  });

	describe('displayTotalInstallSize', function() {
    beforeEach(inject(context));
    it('should calculate total install size for selected components', function() {
			let cdk = confirmController.installerDataSvc.getInstallable('cdk');
    	for (let installer of installerDataSvc.allInstallables().values()) {
        expect(installer.selectedOption).equals('install');
      }
      expect(confirmController.sc.updateTotalInstallSize()).equals(cdk.installSize);
    });
  });

  describe('displayTotalDownloadSize', function() {
    beforeEach(inject(context));
    it('should calculate total download size for selected components', function() {
			let cdk = confirmController.installerDataSvc.getInstallable('cdk');
			for (let installer of installerDataSvc.allInstallables().values()) {
				expect(installer.selectedOption).equals('install');
				}
			expect(confirmController.sc.updateTotalDownloadSize()).equals(cdk.size);
		});
  });
});