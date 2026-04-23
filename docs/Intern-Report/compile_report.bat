@echo off
echo Compiling VerbaSense Internship Report...

:: First pass to generate aux files
pdflatex -interaction=nonstopmode report.tex

:: Process bibliography and glossaries
bibtex report
makeglossaries report

:: Second pass to include citations
pdflatex -interaction=nonstopmode report.tex

:: Third pass to finalize cross-references
pdflatex -interaction=nonstopmode report.tex

echo.
echo Compilation complete!
echo Cleaning up auxiliary files...

del *.aux *.log *.out *.toc *.blg *.bbl

echo Done.
pause
