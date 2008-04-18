/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Sebastian Werner (wpbasti)
     * Fabian Jakobs (fjakobs)

************************************************************************ */

/**
 * A full featured horizontal box layout. It lays out widgets in a
 * horizontal row, from left to right.
 *
 * Supports the following features:
 *
 * * Percent and flex widths
 * * Minimum and maximum dimensions
 * * Priorized growing/shrinking (flex)
 * * Left and right margins
 * * Horizontal align
 * * Horizontal spacing
 * * Reversed children layout
 * * Vertical children stretching
 * * Auto sizing
 *
 * Names used by other toolkits:
 *
 * * QHBoxLayout (Qt)
 * * StackPanel (XAML)
 * * RowLayout (SWT)
 */
qx.Class.define("qx.ui.layout.HBox",
{
  extend : qx.ui.layout.AbstractBox,






  /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */

  properties :
  {
    /** Horizontal alignment of the whole children block */
    align :
    {
      check : [ "left", "center", "right" ],
      init : "left",
      apply : "_applyLayoutChange"
    }
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
      LAYOUT INTERFACE
    ---------------------------------------------------------------------------
    */

    // overridden
    renderLayout : function(availWidth, availHeight)
    {
      // Cache children
      var children = this._getLayoutChildren();
      var length = children.length;
      var util = qx.ui.layout.Util;

      if (this.getReversed())
      {
        var start = length-1;
        var end = -1;
        var increment = -1;
      }
      else
      {
        var start = 0;
        var end = length;
        var increment = 1;
      }



      // **************************************
      //   Caching children data
      // **************************************

      // First run to cache children data and compute allocated width
      var child, layoutWidth;
      var widths = [];
      var gaps = this._getGaps();

      for (var i=start; i!=end; i+=increment)
      {
        child = children[i];

        layoutWidth = child.getLayoutProperties().width;
        if (layoutWidth)
        {
          if (util.PERCENT_VALUE.test(layoutWidth))
          {
            widths[i] = Math.floor((availWidth - gaps) * parseFloat(layoutWidth) / 100);
          }
          else if (util.FLEX_VALUE.test(layoutWidth))
          {
            // Flex values here are a shortcut for width+flex (width should start at the minwidth)
            widths[i] = child.getSizeHint().minWidth;
          }
          else
          {
            throw new Error("Invalid layout width: " + layoutWidth);
          }
        }
        else
        {
          widths[i] = child.getSizeHint().width;
        }
      }

      var allocatedWidth = qx.lang.Array.sum(widths) + gaps;

      // this.debug("Initial widths: avail=" + availWidth + ", allocatedWidth=" + allocatedWidth);




      // **************************************
      //   Flex support (growing/shrinking)
      // **************************************

      if (allocatedWidth != availWidth)
      {
        var flexibles = [];
        var grow = allocatedWidth < availWidth;
        var flex;

        for (var i=start; i!=end; i+=increment)
        {
          child = children[i];

          layoutWidth = child.getLayoutProperties().width;
          if (layoutWidth && util.FLEX_VALUE.test(layoutWidth)) {
            flex = parseInt(layoutWidth, 10);
          } else {
            flex = child.getLayoutProperties().flex || 0;
          }

          if (flex > 0)
          {
            hint = child.getSizeHint();
            var potential = grow ? hint.maxWidth - hint.width : hint.width - hint.minWidth;

            if (potential != 0)
            {
              flexibles.push({
                id : i,
                potential : potential,
                flex : grow ? flex : 1 / flex
              });
            }
          }
        }

        if (flexibles.length > 0)
        {
          var offsets = qx.ui.layout.Util.computeFlexOffsets(flexibles, availWidth - allocatedWidth);

          for (var key in offsets) {
            widths[key] += offsets[key];
          }

          // Update allocated width
          allocatedWidth = qx.lang.Array.sum(widths) + gaps;
        }
      }

      // this.debug("Corrected widths: avail=" + width + ", used=" + allocatedWidth);




      // **************************************
      //   Alignment support
      // **************************************

      var left = 0;
      if (allocatedWidth < availWidth && this.getAlign() != "left")
      {
        left = availWidth - allocatedWidth;

        if (this.getAlign() === "center") {
          left = Math.round(left / 2);
        }
      }




      // **************************************
      //   Layouting children
      // **************************************

      var prev, hint, top, height, width, marginEnd, marginStart;
      var spacing = this.getSpacing();

      for (var i=start; i!=end; i+=increment)
      {
        child = children[i];
        var props = child.getLayoutProperties()

        // Compute left position of this child
        if (left < availWidth)
        {
          if (i === start)
          {
            left += props.marginLeft || 0;
          }
          else
          {
            // "prev" is the previous child from the previous interation
            marginEnd = props.marginRight ||  0;
            marginStart = props.marginLeft || 0;

            // "width" is still the width of the previous child
            left += width + spacing + util.collapseMargins(marginEnd, marginStart);
          }
        }

        // Do the real rendering
        hint = child.getSizeHint();
        height = Math.max(hint.minHeight, Math.min(availHeight, hint.maxHeight));

        // Respect vertical alignment
        top = util.computeVerticalAlignOffset(props.align || "top", height, availHeight);

        // Load width
        width = widths[i];

        // Layout child
        child.renderLayout(left, top, width, height);

        // Remember previous child
        prev = child;
      }
    },


    // overridden
    _computeSizeHint : function()
    {
      var util = qx.ui.layout.Util;

      // Read children
      var children = this._getLayoutChildren();
      var length = children.length;

      if (this.getReversed())
      {
        var start = length-1;
        var end = -1;
        var increment = -1;
      }
      else
      {
        var start = 0;
        var end = length;
        var increment = 1;
      }

      // Initialize
      var minWidth=0, width=0;
      var minHeight=0, height=0;
      var hint, flex, child;

      // Iterate over children
      for (var i=start; i!=end; i+=increment)
      {
        child = children[i];
        hint = child.getSizeHint();

        // Sum up widths
        width += hint.width;

        // Detect if child is shrinkable and update minWidth
        layoutWidth = child.getLayoutProperties().width;
        if (layoutWidth && util.FLEX_VALUE.test(layoutWidth)) {
          flex = parseInt(layoutWidth, 10);
        } else {
          flex = child.getLayoutProperties().flex || 0;
        }

        minWidth += flex > 0 ? hint.minWidth : hint.width;

        // Find maximum heights
        if (hint.height > height) {
          height = hint.height;
        }

        if (hint.minHeight > minHeight) {
          minHeight = hint.minHeight;
        }
      }

      // Respect gaps
      var gaps = this._getGaps();

      // Return hint
      return {
        minWidth : minWidth + gaps,
        width : width + gaps,
        minHeight : minHeight,
        height : height
      };
    },







    /*
    ---------------------------------------------------------------------------
      LAYOUT HELPERS
    ---------------------------------------------------------------------------
    */

    /**
     * Computes the area occopied by spacing and margin.
     *
     * @type member
     * @return {Integer} The computed sum
     */
    _getGaps : function()
    {
      var util = qx.ui.layout.Util;

      // Cache children data
      var children = this._getLayoutChildren();
      var child;
      var length = children.length;

      if (this.getReversed())
      {
        var start = length-1;
        var end = -1;
        var increment = -1;
      }
      else
      {
        var start = 0;
        var end = length;
        var increment = 1;
      }

      // Initialize gaps
      var gaps = this.getSpacing() * (length - 1);

      // Add inner margins (with collapsing support)
      var marginEnd, marginStart;

      // Add margin left of first child (no collapsing here)
      child = children[start];
      var props = child.getLayoutProperties();

      gaps += props.marginLeft || 0;

      // Ignore last child here (will be added later)
      for (var i=start+increment; i!=end; i+=increment)
      {
        marginEnd = props.marginRight || 0;

        child = children[i];

        marginStart = props.marginLeft || 0;

        gaps += util.collapseMargins(marginEnd, marginStart);
      }

      // Add margin right of last child (no collapsing here)
      gaps += props.marginRight || 0;

      return gaps;
    }
  }
});
