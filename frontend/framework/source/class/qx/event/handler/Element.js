/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2007-2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Sebastian Werner (wpbasti)

************************************************************************ */

/**
 * This class supports typical DOM element inline events like scroll,
 * change, select, ...
 */
qx.Class.define("qx.event.handler.Element",
{
  extend : qx.core.Object,
  implement : qx.event.IEventHandler,




  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  /**
   * Create a new instance
   *
   * @type constructor
   * @param manager {qx.event.Manager} Event manager for the window to use
   */
  construct : function(manager)
  {
    this.base(arguments);

    this._manager = manager;
    this._registeredEvents = {};
  },




  /*
  *****************************************************************************
     STATICS
  *****************************************************************************
  */

  statics :
  {
    /** {Integer} Priority of this handler */
    PRIORITY : qx.event.Registration.PRIORITY_NORMAL
  },





  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    /*
    ---------------------------------------------------------------------------
      EVENT HANDLER INTERFACE
    ---------------------------------------------------------------------------
    */

    // interface implementation
    canHandleEvent : function(target, type) {
      return this.__eventTypes[type] && target.nodeType !== undefined;
    },


    // interface implementation
    registerEvent : function(target, type, capture)
    {
      var elementId = qx.core.ObjectRegistry.toHashCode(target);
      var listener = qx.lang.Function.listener(this._onNative, this, elementId);

      qx.bom.Event.addNativeListener(target, type, listener);

      var id = elementId + type;

      this._registeredEvents[id] =
      {
        element : target,
        type : type,
        listener : listener
      };
    },


    // interface implementation
    unregisterEvent : function(target, type, capture)
    {
      var id = qx.core.ObjectRegistry.toHashCode(target) + type;

      var eventData = this._registeredEvents[id];
      qx.bom.Event.removeNativeListener(target, type, eventData.listener);

      delete this._registeredEvents[id];
    },







    /*
    ---------------------------------------------------------------------------
      HELPER
    ---------------------------------------------------------------------------
    */

    /** {Map} Internal data structure with all supported BOM element events */
    __eventTypes :
    {
      abort : true,    // Image elements
      scroll : true,
      select : true,
      reset : true,    // Form Elements
      submit : true   // Form Elements
    },






    /*
    ---------------------------------------------------------------------------
      EVENT-HANDLER
    ---------------------------------------------------------------------------
    */

    /**
     * Default event handler.
     *
     * @type member
     * @param domEvent {Event} DOM event
     * @param elementId {Integer} element id of the current target
     * @return {void}
     */
    _onNative : function(domEvent, elementId)
    {
      var evt = qx.event.Registration.createEvent(null, qx.event.type.Dom, [domEvent]);

      var eventData = this._registeredEvents[elementId + evt.getType()];
      var element = eventData ? eventData.element : evt.getTarget();

      evt.setCurrentTarget(element);

      this._manager.dispatchEvent(domEvent.target || domEvent.srcElement, evt);
    }
  },





  /*
  *****************************************************************************
     DESTRUCTOR
  *****************************************************************************
  */

  destruct : function()
  {
    var entry;
    var events = this._registeredEvents;

    for (var id in events)
    {
      entry = events[id];
      qx.bom.Event.removeNativeListener(entry.element, entry.type, entry.listener);
    }

    this._disposeFields("_manager", "_registeredEvents");
  },






  /*
  *****************************************************************************
     DEFER
  *****************************************************************************
  */

  defer : function(statics) {
    qx.event.Registration.addHandler(statics);
  }
});
