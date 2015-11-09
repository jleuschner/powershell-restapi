module.exports.PSInitCommands = function() {
  return [
        // Encoding UTF8
        'chcp 65001',
        '$OutputEncoding = [System.Text.Encoding]::GetEncoding(65001)',

        // Module
        'Import-Module Import-Modul activedirectory'
  ]
}

module.exports.PSDestroyCommands = function() {
    return [
          'Remove-Module activedirectory'
          ]
  }

module.exports.BlacklistedCommands = function() {
  return [
      {'regex':'.*Invoke-Expression.*', 'flags':'i'},
      {'regex':'.*ScriptBlock.*', 'flags':'i'},
      {'regex':'.*Get-Acl.*', 'flags':'i'},
      {'regex':'.*Set-Acl.*', 'flags':'i'},
      {'regex':'.*Get-Content.*', 'flags':'i'},
      {'regex':'.*-History.*', 'flags':'i'},
      {'regex':'.*Out-File.*', 'flags':'i'}
  ]
}

/**
* Configuration auto invalidation, checking PSSession availability
* @param checkIntervalMS
*/
module.exports.AutoInvalidationConfig = function(checkIntervalMS) {
      return {
              'checkIntervalMS': checkIntervalMS,
              'commands': [
              // no remote pssession established? invalid!
              { 'command': 'Get-PSSession',
                'regexes': {
                  'stdout' : [ {'regex':'.*Opened.*', 'flags':'i', 'invalidOn':'noMatch'}]
                }
              }]
          };
  }


var CommandRegistry = {

    /*******************************
    *
    * Powershell Command registry
    *
    * argument properties (optional):
    *    - quoted: true|false, default true
    *    - valued: true|false, default true
    *    - default: optional default value (only if valued..)
    *
    * return properties:
    *   type: none, text or json are valid values
    *
    ********************************/

    'changePasswd': {
      'command': 'Set-ADAccountPassword {{{arguments}}}',
      'arguments': {
        'Identity': {quoted : false},
        'OldPassword': {quoted : false},
        'NewPassword': {quoted : false}
      },
      'return': { type: 'json' }
    },
    'setPasswd': {
      'command': 'Set-ADAccountPassword {{{arguments}}} -Reset',
      'arguments': {
        'Identity': {quoted : false},
        'NewPassword': {quoted : false}
      },
      'return': { type: 'json' }
    },
    'TestConnection': {
      'command': 'Test-Connection {{{arguments}}}  | ConvertTo-Json -Compress',
      'arguments': {
        'computername': {quoted : false},
				'count': {quoted : false, valued: true, default: '1' },
        'quiet': {quoted : false, valued: false},
      },
      'return': { type: 'json' }
    },
    'getSmsSoftware': {
      'command': 'get-wmiobject {{{arguments}}} -query "SELECT * FROM SMS_InstalledSoftware" -namespace "root\\CIMV2\\sms" | select Publisher,SoftwareCode, ProductName,UninstallString | ConvertTo-Json -Compress',
      'arguments': {
        'computername': {quoted : false},
      },
      'return': { type: 'json' }
    },
    'getADComputer': {
      'command': 'get-ADComputer {{{arguments}}} | ConvertTo-Json -Compress',
      'arguments': {
        'filter': {quoted : false},
				'properties': {quoted : false}
      },
      'return': { type: 'json' }
    },
    'getADUser': {
      'command': 'get-ADUser {{{arguments}}} | ConvertTo-Json -Compress',
      'arguments': {
        'filter': {quoted : false},
				'properties': {quoted : false}
      },
      'return': { type: 'json' }
    },
    'ResolveDnsName': {
      'command': 'Resolve-DnsName {{{arguments}}} | ConvertTo-Json -Compress',
      'arguments': {
        'name': {}
      },
      'return': { type: 'json' }
    },
    'getMissingUpdates': {
			'command': 'get-wmiobject -query "SELECT * FROM CCM_SoftwareUpdate" -namespace "ROOT\\ccm\\ClientSDK" {{{arguments}}} | ConvertTo-Json -Compress',
      'arguments': {
        'computername': {quoted : false}
      },
      'return': { type: 'json' }
    },
    'getUpdatesCount': {
			'command': 'get-wmiobject -query "SELECT name FROM CCM_SoftwareUpdate" -namespace "ROOT\\ccm\\ClientSDK" {{{arguments}}} | measure | ConvertTo-Json -Compress',
      'arguments': {
        'computername': {quoted : false}
      },
      'return': { type: 'json' }
    },


    'getMsolUser': {
      'command': 'Get-MsolUser {{{arguments}}} | ConvertTo-Json',
      'arguments': {
        'UserPrincipalName': {}
      },
      'return': { type: 'json' }
    },

    'newMsolUser': {
      'command': 'New-MsolUser {{{arguments}}} | ConvertTo-Json',
      'arguments': {
        'DisplayName': {},
        'UserPrincipalName': {}
      },
      'return': { type: 'json' }
    },

    'removeMsolUser': {
      'command': 'Remove-MsolUser -Force {{{arguments}}} ',
      'arguments': {
        'UserPrincipalName': {}
      },
      'return': { type: 'none' }
    },

    /*******************************
    * DistributionGroups
    ********************************/

    'getDistributionGroup': {
        'command': 'Get-DistributionGroup {{{arguments}}} | ConvertTo-Json',
        'arguments': {
            'Identity': {}
        },
        'return': { type: 'json' }
    },

    'newDistributionGroup': {

        'command': 'New-DistributionGroup -Confirm:$False {{{arguments}}} | ConvertTo-Json',

        'arguments': {
            'Name':               {},
            'DisplayName':        {},
            'Alias':              {},
            'PrimarySmtpAddress': {},
            'Type':               {'quoted':false, 'default':'Security'},
            'ManagedBy':          {},
            'Members':            {}, // specifying members on create does not seem to work
            'ModerationEnabled':              { 'default':'0', 'quoted':false},
            'MemberDepartRestriction':        { 'default':'Closed'},
            'MemberJoinRestriction':          { 'default':'Closed'},
            'SendModerationNotifications':    { 'default':'Never', 'quoted':false},

        },
        'return': { type: 'json' }
    },

    'setDistributionGroup': {

        'command': 'Set-DistributionGroup -Confirm:$False {{{arguments}}}',

        'arguments': {
            'Identity':           {},
            'Name':               {},
            'DisplayName':        {},
            'Alias':              {},
            'PrimarySmtpAddress': {},
            'ManagedBy':          {},
            'Members':            {},
            'MailTip':            {},
            'ModerationEnabled':              { 'default':'0', 'quoted':false},
            'MemberDepartRestriction':        { 'default':'Closed'},
            'MemberJoinRestriction':          { 'default':'Closed'},
            'SendModerationNotifications':    { 'default':'Never', 'quoted':false},
            'BypassSecurityGroupManagerCheck': {'valued': false}
        },
        'return': { type: 'none' }
    },


    'removeDistributionGroup': {

        'command': 'Remove-DistributionGroup {{{arguments}}} -Confirm:$false',

        'arguments': {
            'Identity':           {},
            // needed if invoking as global admin who is not explicitly a group admin.. stupid... yes.
            'BypassSecurityGroupManagerCheck': {'valued': false}
        },
        'return': { type: 'none' }
    },


    'getDistributionGroupMember': {

        'command': 'Get-DistributionGroupMember {{{arguments}}} | ConvertTo-Json',

        'arguments': {
            'Identity':           {}
        },
        'return': { type: 'json' }
    },


    'addDistributionGroupMember': {

        'command': 'Add-DistributionGroupMember {{{arguments}}}',

        'arguments': {
            'Identity':           {},
            'Member':             {},
            // needed if invoking as global admin who is not explicitly a group admin.. stupid... yes.
            'BypassSecurityGroupManagerCheck': {'valued': false}
        },
        'return': { type: 'none' }
    },

    // members specified w/ this are a full overwrite..
    'updateDistributionGroupMembers': {

        'command': 'Update-DistributionGroupMember -Confirm:$false {{{arguments}}}',

        'arguments': {
            'Identity':           {},
            'Members':            {},
            // needed if invoking as global admin who is not explicitly a group admin.. stupid... yes.
            'BypassSecurityGroupManagerCheck': {'valued': false}
        },
        'return': { type: 'none' }
    },

    'removeDistributionGroupMember': {

        'command': 'Remove-DistributionGroupMember {{{arguments}}} -Confirm:$false',

        'arguments': {
            'Identity':          {},
            'Member':            {},
            // needed if invoking as global admin who is not explicitly a group admin.. stupid... yes.
            'BypassSecurityGroupManagerCheck': {'valued': false}
        },
        'return': { type: 'none' }
    },




    /*******************************
    * MailContacts
    ********************************/

    'getMailContact': {
        'command': 'Get-MailContact {{{arguments}}} | ConvertTo-Json',
        'arguments': {
            'Identity': {}
        },
        'return': { type: 'json' }
    },

    'newMailContact': {

        'command': 'New-MailContact -Confirm:$False {{{arguments}}} | ConvertTo-Json',

        'arguments': {
            'Name':                  {},
            'ExternalEmailAddress':  {}
        },

        'return': { type: 'json' }
    },

    'setMailContact': {

        'command': 'Set-MailContact -Confirm:$False {{{arguments}}}',

        'arguments': {
            'Identity':             {},
            'Name':                 {},
            'DisplayName':          {},
            'ExternalEmailAddress': {}
        },

        'return': { type: 'none' }
    },


    'removeMailContact': {

        'command': 'Remove-MailContact {{{arguments}}} -Confirm:$false',

        'arguments': {
            'Identity':           {}
        },

        'return': { type: 'none' }
    }
};

module.exports.Commands = CommandRegistry;

/**
* Some example whitelisted commands
* (only permit) what is in the registry
*/
module.exports.WhitelistedCommands = function() {
    var whitelist = [];
    for (var cmdName in CommandRegistry) {
        var config = CommandRegistry[cmdName];
        var commandStart = config.command.substring(0,config.command.indexOf(' ')).trim();
        whitelist.push({'regex':'^'+commandStart+'\\s+.*', 'flags':'i'});
    }
    return whitelist;
}
