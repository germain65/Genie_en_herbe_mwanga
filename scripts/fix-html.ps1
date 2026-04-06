 = Get-ChildItem -Path . -Filter *.html
foreach ( in ) {
     = Get-Content .FullName -Raw
     =  -replace '<div id="custom-cursor"></div>', ''
    
    # Check if we already added it
    if ( -notmatch 'class="cursor"') {
         =  -replace '<body>', "<body>
<div class="cursor"></div>
<div class="cursor-follower"></div>"
    }

    Set-Content .FullName -Value  -Encoding UTF8
}
