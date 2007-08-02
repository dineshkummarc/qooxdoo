/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2007 1&1 Internet AG, Germany, http://www.1and1.org

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Alexander Back (aback)

************************************************************************ */

/* ************************************************************************

#module(client)
#require(qx.html2.client.Platform)
#require(qx.html2.client.Engine)

************************************************************************ */

/**
 * This class comes with all relevant informations regarding 
 * the client's operating system. This class is examining the userAgent of
 * the browser's build-in navigator object. Currently there are more than 
 * <b>4000</b> (in words: four thousand) different userAgent strings, so this class
 * aims to target only the relevant ones. However this list is not meant to be
 * complete.
 *
 * The listed constants are automatically filled on the initialization 
 * phase of the class. The defaults listed in the API viewer need not 
 * to be identical to the values at runtime.
 */
qx.Class.define("qx.html2.client.System",
{
  /*
  *****************************************************************************
     STATICS
  *****************************************************************************
  */

  statics :
  {
    /** {String} The name of the operating system */
    NAME : "",

    /** {Boolean} Flag to detect if the client system has an installed Service Pack 1 */
    SP1 : false,

    /** {Boolean} Flag to detect if the client system has an installed Service Pack 2 (only available in IE) */
    SP2 : false,

    /** {Boolean} Flag to detect if the client system is Windows 95 */
    WIN95 : false,

    /** {Boolean} Flag to detect if the client system is Windows 98 */
    WIN98 : false,

    /** {Boolean} Flag to detect if the client system is Windows ME */
    WINME : false,

    /** {Boolean} Flag to detect if the client system is Windows NT4 */
    WINNT4 : false,

    /** {Boolean} Flag to detect if the client system is Windows 2000 */
    WIN2000 : false,

    /** {Boolean} Flag to detect if the client system is Windows XP */
    WINXP : false,

    /** {Boolean} Flag to detect if the client system is Windows 2003 (Server) */
    WIN2003 : false,

    /** {Boolean} Flag to detect if the client system is Windows Vista */
    WINVISTA : false,

    /** {Boolean} Flag to detect if the client system is Windows CE */
    WINCE : false,
    
    /** {Boolean} Flag to detect if the client system is Linux */
    LINUX : false,

    /** {Boolean} Flag to detect if the client system is SunOS */
    SUNOS : false,

    /** {Boolean} Flag to detect if the client system is FreeBSD */
    FREEBSD : false,

    /** {Boolean} Flag to detect if the client system is NetBSD */
    NETBSD : false,

    /** {Boolean} Flag to detect if the client system is Mac OS X */
    OSX : false,
    
    /** {Boolean} Flag to detect if the client system is Mac OS 9 */
    OS9 : false,

    /** {Boolean} Flag to detect if the client system is Symbian */
    SYMBIAN : false,

    /** {Boolean} Flag to detect if the client system is Nintendo DS */
    NINTENDODS : false,

    /** {Boolean} Flag to detect if the client system is Playstation Portable */
    PSP : false,
    
    /** Maps user agent names to system IDs */
    __ids : 
    {
      "Windows NT 6.0" : "winvista",
      "Windows NT 5.2" : "win2003",
      "Windows NT 5.1" : "winxp",
      "Windows NT 5.0" : "win2000",
      "Windows 2000" : "win2000",
      "Windows NT 4.0" : "winnt4",
      
      "Win 9x 4.90" : "winme",
      "Windows CE" : "wince",
      "Windows 98" : "win98",
      "Win98" : "win98", 
      "Windows 95" : "win95",
      "Win95" : "win95",
      
      "Linux" : "linux",
      "FreeBSD" : "freebsd",
      "NetBSD" : "netbsd",
      "SunOS" : "sunos",
      
      "Symbian System" : "symbian",
      "Nitro" : "nintendods",
      "PSP" : "sonypsp",
      
      "Mac OS X" : "osx",
      "Mac OS 9" : "os9"
    },


    /**
     * Internal initialize helper
     *
     * @type static
     * @return {void} 
     * @throws TODOC
     */
    __init : function()
    {
      var agent = navigator.userAgent;
      
      var str = [];
      for (var key in this.__ids) {
        str.push(key);
      }
      
      var reg = new RegExp("(" + str.join("|").replace(/\./g, "\.") + ")", "g");
      
      if (!reg.test(agent)) {
        throw new Error("Could not detect system: " + agent);
      }

      this.NAME = this.__ids[RegExp.$1];
      this[this.NAME.toUpperCase()] = true;
        
      if (qx.html2.client.Platform.WIN)
      {
        if (agent.indexOf("Windows NT 5.01")!==-1) {
          this.SP1 = true; 
        } else if (qx.html2.client.Engine.MSHTML && agent.indexOf("SV1")!==-1) {
          this.SP2 = true; 
        }
      }
    }
  },




  /*
  *****************************************************************************
     DEFER
  *****************************************************************************
  */

  defer : function(statics) {
    statics.__init();
  }
});
