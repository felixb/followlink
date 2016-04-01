.PHONY = clean
files = css/* js/* manifest.json README.md LICENSE

followlink.zip: $(files)
	zip -r followlink.zip . -i $(files)

clean:
	rm -f followlink.zip
