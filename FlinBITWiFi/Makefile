ROOTDIR:=$(strip $(shell dirname $(lastword $(MAKEFILE_LIST))))

WEBDIR = $(ROOTDIR)/web
DATADIR = $(ROOTDIR)/data
FOLDERS = $(WEBDIR) $(DATADIR) $(DATADIR)/captive

COMPRESSED_FILES = index.html script.js style.css captive/index.html captive/favicon.ico
RAW_FILES =

.PHONY: SPIFFS
SPIFFS: $(foreach FILE,$(COMPRESSED_FILES),$(DATADIR)/$(FILE).gz) $(foreach FILE,$(RAW_FILES),$(DATADIR)/$(FILE)) | $(FOLDERS)

clean: | $(DATADIR)
	rm -r $(DATADIR)/*

$(DATADIR)/%.gz: $(WEBDIR)/% | $(FOLDERS)
	cp $< $(DATADIR)/$* && gzip -7 --force --suffix=.gz $(DATADIR)/$*

# Folder construction

$(WEBDIR):
	mkdir $(WEBDIR)

$(DATADIR):
	mkdir $(DATADIR)

$(DATADIR)/captive: | $(DATADIR)
	mkdir $(DATADIR)/captive
