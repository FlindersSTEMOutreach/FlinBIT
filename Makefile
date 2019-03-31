ROOTDIR:=$(strip $(shell dirname $(lastword $(MAKEFILE_LIST))))/FlinBITWiFi

WEBDIR = $(ROOTDIR)/web
DATADIR = $(ROOTDIR)/data
FOLDERS = $(WEBDIR) $(DATADIR)
# FOLDERS = $(WEBDIR) $(DATADIR) $(DATADIR)/captive

FILES = index.html.gz script.js.gz style.css.gz dygraph.css.gz dygraph.min.js.gz

.PHONY: SPIFFS
SPIFFS: $(foreach FILE,$(FILES),$(DATADIR)/$(FILE)) | $(FOLDERS)

clean: | $(DATADIR)
	rm -r $(DATADIR)/*

# copy file from /web to /data
$(DATADIR)/%: $(WEBDIR)/% | $(FOLDERS)
	cp $< $(DATADIR)/$*

# compress /data file
$(DATADIR)/%.gz: $(DATADIR)/% | $(FOLDERS)
	gzip -7 --force --suffix=.gz $(DATADIR)/$*

# Folder construction

$(WEBDIR):
	mkdir $(WEBDIR)

$(DATADIR):
	mkdir $(DATADIR)

# $(DATADIR)/captive: | $(DATADIR)
# 	mkdir $(DATADIR)/captive
